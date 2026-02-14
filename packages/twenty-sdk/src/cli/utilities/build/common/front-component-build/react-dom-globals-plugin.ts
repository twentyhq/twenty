import { createGlobalsPlugin } from './utils/create-globals-plugin';

// Comprehensive react-dom exports so third-party libraries that import
// react-dom resolve correctly against globalThis.ReactDOM
const REACT_DOM_STATIC_EXPORTS = `
export var createPortal = /* @__PURE__ */ (() => globalThis.ReactDOM.createPortal)();
export var flushSync = /* @__PURE__ */ (() => globalThis.ReactDOM.flushSync)();
export var findDOMNode = /* @__PURE__ */ (() => globalThis.ReactDOM.findDOMNode)();
export var hydrate = /* @__PURE__ */ (() => globalThis.ReactDOM.hydrate)();
export var render = /* @__PURE__ */ (() => globalThis.ReactDOM.render)();
export var unmountComponentAtNode = /* @__PURE__ */ (() => globalThis.ReactDOM.unmountComponentAtNode)();
export var unstable_batchedUpdates = /* @__PURE__ */ (() => globalThis.ReactDOM.unstable_batchedUpdates)();
export var version = /* @__PURE__ */ (() => globalThis.ReactDOM.version)();
export default /* @__PURE__ */ (() => globalThis.ReactDOM)();
`.trim();

const REACT_DOM_CLIENT_STATIC_EXPORTS = `
export var createRoot = /* @__PURE__ */ (() => globalThis.ReactDOM.createRoot)();
export var hydrateRoot = /* @__PURE__ */ (() => globalThis.ReactDOM.hydrateRoot)();
`.trim();

export const reactDomGlobalsPlugin = createGlobalsPlugin({
  pluginName: 'react-dom-globals',
  namespace: 'react-dom-globals',
  moduleName: 'react-dom',
  moduleFilter: /^react-dom(\/client)?$/,
  collectImports: () => new Map(),
  generateExports: () => '',
  staticContents: {
    'react-dom': REACT_DOM_STATIC_EXPORTS,
    'react-dom/client': REACT_DOM_CLIENT_STATIC_EXPORTS,
  },
});
