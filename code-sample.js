import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/neon-animation/animations/hero-animation.js';
import 'highlightjs/highlight.pack.min.js';
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import '@polymer/iron-icon/iron-icon.js';
import 'boo-window/boo-window.js';

/* global hljs */

/**
 * `<code-sample>` uses [highlight.js](https://highlightjs.org/) for syntax highlighting.
 *
 * @customElement
 * @demo https://kcmr.github.io/code-sample/
 */
class CodeSample extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        :host([hidden]),
        [hidden] {
          display: none;
        }
        pre {
          margin: 0;
        }
        pre, code {
          font-family: var(--code-sample-font-family, Operator Mono, Inconsolata, Roboto Mono, monaco, consolas, monospace);
          font-size: var(--code-sample-font-size, 14px);
        }
        .hljs {
          padding: 0 20px;
          line-height: 1.3;
        }
        .full-code-container {
          -webkit-overflow-scrolling: touch;
          @apply --code-sample-full-code-container;
          max-height: 100vh;
          overflow: auto;
        }
        .code-container {
          -webkit-overflow-scrolling: touch;
          @apply --code-sample-code-container;
          max-height: 80vh;
          overflow: auto;
        }
        .code-container:hover {
          @apply --code-sample-code-container-hover;
        }
        .demo:not(:empty) {
          padding: var(--code-sample-demo-padding, 0 0 20px);
        }
        .demo {
          @apply --code-sample-demo;
        }
        #code-container {
          position: relative;
        }
        div.toolbar {
          background: #e0e0e0;
          position: absolute;
          display: block;
          right: 0;
          top: 0;
          visibility: visible;
          color: black;
          border-radius: 0px 0px 0px 3px;
          z-index: 1;
        }
        iron-icon {
          cursor: pointer;
        }
      </style>

      <iron-iconset-svg size="28" name="icons">
        <svg><defs>
          <g id="content-copy"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></g>
          <g id="fullscreen"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></g>
          <g id="fullscreen-exit"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></g>
        </defs></svg>
      </iron-iconset-svg>

      <boo-window
        id="win"
        opened="{{fullOpened}}"
        width="90%" pos-policy="center">

        <div slot="content" style="position: relative">
          <div class="toolbar">

            <iron-icon
              title="退出全屏"
              icon="icons:fullscreen-exit"
              on-click="_closeFull"></iron-icon>

            <iron-icon
              title="复制到粘贴板"
              icon="icons:content-copy"
              on-click="_copyToClipboard"></iron-icon>

          </div>
          <div class="full-code-container">
            <pre id="fullCode"></pre>
          </div>
        </div>

      </boo-window>

      <div id="theme"></div>
      <div id="demo" class="demo"></div>

      <slot id="content"></slot>

      <div id="code-container">
        <div class="toolbar">
          <iron-icon
            title="全屏"
            icon="icons:fullscreen"
            on-click="_openFullCode"></iron-icon>
          <iron-icon
            title="复制到粘贴板"
            icon="icons:content-copy"
            on-click="_copyToClipboard"></iron-icon>
        </div>
        <div class="code-container">
          <pre id="code"></pre>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      showToolbar: {
        type: Boolean,
        reflectToAttribute: true
      },
      fullOpened: {
        type: Boolean,
        notify: true
      },
      // Tagged template literal with custom styles.
      theme: {
        type: String,
        observer: '_themeChanged',
      },
      // Set to true to render the code inside the template.
      render: Boolean,
      // Code type (optional). (eg.: html, js, css)
      // Options are the same as the available classes for `<code>` tag using highlight.js
      type: String,
      // theme name
      themeName: {
        type: String,
        reflectToAttribute: true,
        observer: '_themeNameChanged',
        value: 'one-dark',
      }
    };
  }

  _toCamelCase(value) {
    return value.replace(/-./g,
      (match) => match.charAt(1).toUpperCase()
    );
  }

  _openFullCode() {
    this.fullOpened = true;
    this.dispatchEvent(new CustomEvent("full-changed", {detail: {fullOpened: true}}));
  }

  _closeFull() {
    this.fullOpened = false;
    this.dispatchEvent(new CustomEvent("full-changed", {detail: {fullOpened: false}}));
  }

  _themeNameChanged(themeName) {
    let imported = null;
    switch (themeName) {
    case 'atom-one-light':
      imported = import('./themes/atom-one-light.js');
      break;
    case 'one-dark':
      imported = import('./themes/one-dark.js');
      break;
    case 'default':
      imported = import('./themes/default.js');
      break;
    case 'github':
      imported = import('./themes/github.js');
      break;
    case 'kustom-dark':
      imported = import('./themes/kustom-dark.js');
      break;
    case 'kustom-light':
      imported = import('./themes/kustom-light.js');
      break;
    case 'solarized-light':
      imported = import('./themes/solarized-light.js');
      break;
    case 'solarized-dark':
      imported = import('./themes/solarized-dark.js');
      break;
    default:
      throw 'theme not supported';
    }
    imported.then(function(res) {
      let map = {
        "atom-one-light": "atomOneLight",
        "one-dark": "oneDark",
        "default": "defaultTheme",
        "github": "github",
        "kustom-dark": "kustomDark",
        "kustom-light": "kustomLight",
        "solarized-light": "solarizedLight",
        "solarized-dark": "solarizedDark",
      };
      this.theme = res[map[themeName]];

    }.bind(this));
  }

  _themeChanged(theme) {
    this.$.theme.innerHTML = theme.innerHTML;
  }

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      let tmp = this.querySelector('template');
      this._updateContent(tmp);
    }, 1);
    this.sharedElements = {
      code: this.$.code,
    };
    this.$.win.sharedElements = {
      code: this.$.win.shadowRoot.querySelector('.wrapper'),
    };
    this._animation();
  }

  code() {
    let tmp = this.querySelector('template');
    if (tmp) {
      return tmp.innerHTML;
    }

    return "";
  }

  _updateContent(template) {
    if (this._code) this._code.parentNode.removeChild(this._code);
    if (this._demo) this.$.demo.innerHTML = '';

    if (this.render) {
      this._demo = this.$.demo.appendChild(
        document.importNode(template, true)
      );
    }

    this._highlight(template.innerHTML);
  }

  _highlight(str) {
    this._code = document.createElement('code');
    if (this.type) this._code.classList.add(this.type);
    this._code.innerHTML = this._entitize(this._cleanIndentation(str));
    this.$.code.appendChild(this._code);
    hljs.highlightBlock(this._code);
    this.$.fullCode.appendChild(this._code.cloneNode(true));
  }

  _cleanIndentation(str) {
    return str;
    // const pattern = str.match(/\s*\n[\t\s]*/);
    // return str.replace(new RegExp(pattern, 'g'), '\n');
  }

  _entitize(str) {
    return String(str)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/=""/g, '')
      .replace(/=&gt;/g, '=>')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  _copyToClipboard(e) {
    let target = e.target;
    const tempNode = document.createElement('textarea');
    document.body.appendChild(tempNode);
    tempNode.value = this.querySelector('template').innerHTML;
    tempNode.select();
    let result = false;
    try {
      result = document.execCommand('copy', false);
      target.innerHTML = 'Done';
    } catch (err) {
      console.error(err);
      target.innerHTML = 'Error';
    }
    tempNode.remove();
    setTimeout(function() {
      target.innerHTML = 'Copy';
    }.bind(this), 1000);

    return result;
  }

  _animation() {
   this.$.win.animationConfig = {
      entry: [{
        name: "hero-animation",
        id: "code",
        fromPage: this,
        toPage: this.$.win,
      }],
      exit: [{
        name: "hero-animation",
        id: "code",
        fromPage: this.$.win,
        toPage: this,
      }]
    };
  }
}

customElements.define('code-sample', CodeSample);
