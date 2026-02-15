import type * as esbuild from 'esbuild';

// Wraps both react/jsx-runtime and react so that ALL element creation
// (jsx, jsxs, createElement — including from third-party libraries)
// goes through remote component mapping, style injection, and event
// handler bridging.
//
// React 18 uses event delegation — it never calls addEventListener
// on individual elements and strips function props from custom elements.
// Remote DOM only forwards events with explicit listeners.  We bridge
// this by extracting event handler props (onClick, onChange, …) and
// using a ref callback to set them as properties (element.onclick = fn)
// which triggers Remote DOM's event serialization to the host.

// Shared helper code injected into both wrappers
const SHARED_HELPERS = `
var _customElementMap = globalThis.__HTML_TAG_TO_CUSTOM_ELEMENT_TAG__ || {};

var _injectedStyleKeys = {};

function _injectStyleViaHead(cssText) {
  if (!cssText) return;
  var hash = 0;
  for (var i = 0; i < cssText.length; i++) {
    hash = ((hash << 5) - hash + cssText.charCodeAt(i)) | 0;
  }
  var key = 'jsx-style-' + hash;
  if (_injectedStyleKeys[key]) return;
  _injectedStyleKeys[key] = true;
  var el = document.createElement('style');
  el.setAttribute('data-jsx-style', key);
  el.textContent = cssText;
  document.head.appendChild(el);
}

function _extractCssText(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children))
    return children
      .filter(function (c) { return typeof c === 'string'; })
      .join('');
  return '';
}

// Map React event prop names that differ from the DOM event name
var _reactToDomEvent = {
  ondoubleclick: 'ondblclick',
};

// Returns true for React event handler props: onClick, onChange, etc.
function _isEventProp(name) {
  return (
    name.length > 2 &&
    name.charCodeAt(0) === 111 && // 'o'
    name.charCodeAt(1) === 110 && // 'n'
    name.charCodeAt(2) >= 65 &&
    name.charCodeAt(2) <= 90      // uppercase letter
  );
}

// Extract event handler props from a props object.
// Returns { cleanProps, events } where events is null if none found.
function _splitEventProps(props) {
  if (!props) return { cleanProps: props, events: null };
  var events = null;
  var cleanProps = null;
  for (var k in props) {
    if (_isEventProp(k) && typeof props[k] === 'function') {
      if (!events) {
        events = {};
        cleanProps = {};
        for (var j in props) {
          if (j === k) break;
          cleanProps[j] = props[j];
        }
      }
      events[k] = props[k];
    } else if (events) {
      cleanProps[k] = props[k];
    }
  }
  return { cleanProps: cleanProps || props, events: events };
}

// Create a ref callback that sets event handler properties on the DOM
// element.  Remote DOM elements have property setters for on<event>
// that register the listener and forward it to the host.
function _makeEventRef(events, userRef) {
  return function(el) {
    if (el) {
      for (var name in events) {
        var domName = _reactToDomEvent[name.toLowerCase()] || name.toLowerCase();
        el[domName] = events[name];
      }
    }
    if (typeof userRef === 'function') userRef(el);
    else if (userRef != null && typeof userRef === 'object') userRef.current = el;
  };
}
`;

const JSX_RUNTIME_WRAPPER = `
import {
  jsx as _originalJsx,
  jsxs as _originalJsxs,
  Fragment,
} from '__real_react_jsx_runtime__';

${SHARED_HELPERS}

function _wrapJsxFactory(originalFactory) {
  return function wrappedJsx(type, props, key) {
    if (typeof type === 'string') {
      if (type === 'style') {
        var css =
          props && props.dangerouslySetInnerHTML
            ? props.dangerouslySetInnerHTML.__html || ''
            : _extractCssText(props && props.children);
        _injectStyleViaHead(css);
        return null;
      }

      var customTag = _customElementMap[type];
      if (customTag) {
        var split = _splitEventProps(props);
        if (split.events) {
          var cp = split.cleanProps;
          cp.ref = _makeEventRef(split.events, cp.ref);
          return originalFactory(customTag, cp, key);
        }
        return originalFactory(customTag, props, key);
      }
    }
    return originalFactory(type, props, key);
  };
}

export var jsx = _wrapJsxFactory(_originalJsx);
export var jsxs = _wrapJsxFactory(_originalJsxs);
export { Fragment };
`.trim();

const REACT_WRAPPER = `
export * from '__real_react__';
import _React from '__real_react__';

${SHARED_HELPERS}

var _originalCreateElement = _React.createElement;

function createElement(type) {
  var args = arguments;
  if (typeof type === 'string') {
    if (type === 'style') {
      var props = args.length > 1 ? args[1] : null;
      if (props) {
        var css = props.dangerouslySetInnerHTML
          ? props.dangerouslySetInnerHTML.__html || ''
          : _extractCssText(props.children);
        _injectStyleViaHead(css);
      }
      return null;
    }

    var customTag = _customElementMap[type];
    if (customTag) {
      var ceProps = args.length > 1 ? args[1] : null;
      var split = _splitEventProps(ceProps);
      if (split.events) {
        var cp = split.cleanProps || {};
        cp.ref = _makeEventRef(split.events, cp.ref);
        var newArgs = [customTag, cp];
        for (var i = 2; i < args.length; i++) newArgs.push(args[i]);
        return _originalCreateElement.apply(null, newArgs);
      }
      var newArgs2 = [customTag];
      for (var i2 = 1; i2 < args.length; i2++) newArgs2.push(args[i2]);
      return _originalCreateElement.apply(null, newArgs2);
    }
  }
  return _originalCreateElement.apply(null, args);
}

export { createElement };
export default Object.assign({}, _React, { createElement: createElement });
`.trim();

type JsxRuntimeRemoteWrapperPluginOptions = {
  usePreact?: boolean;
};

export const createJsxRuntimeRemoteWrapperPlugin = (
  options?: JsxRuntimeRemoteWrapperPluginOptions,
): esbuild.Plugin => {
  const usePreact = options?.usePreact ?? false;

  // When usePreact is true, resolve the underlying modules to preact
  const jsxRuntimeModule = usePreact ? 'preact/jsx-runtime' : 'react/jsx-runtime';
  const reactModule = usePreact ? 'preact/compat' : 'react';

  return {
    name: 'jsx-runtime-remote-wrapper',
    setup(build) {
      let realJsxRuntimePath: string | undefined;
      let realReactPath: string | undefined;
      let preactCompatPath: string | undefined;

      // --- react/jsx-runtime ---

      build.onResolve({ filter: /^react\/jsx-runtime$/ }, async (args) => {
        if (args.pluginData?.skipJsxWrapper) {
          return undefined;
        }

        if (!realJsxRuntimePath) {
          const resolved = await build.resolve(jsxRuntimeModule, {
            kind: args.kind,
            resolveDir: args.resolveDir,
            pluginData: { skipJsxWrapper: true },
          });

          realJsxRuntimePath = resolved.path;
        }

        return {
          path: 'react/jsx-runtime',
          namespace: 'jsx-runtime-wrapper',
        };
      });

      build.onResolve({ filter: /^__real_react_jsx_runtime__$/ }, () => {
        if (!realJsxRuntimePath) {
          throw new Error(
            'jsx-runtime-remote-wrapper: real jsx-runtime path not resolved yet',
          );
        }

        return { path: realJsxRuntimePath };
      });

      build.onLoad(
        { filter: /.*/, namespace: 'jsx-runtime-wrapper' },
        () => ({
          contents: JSX_RUNTIME_WRAPPER,
          loader: 'js' as const,
        }),
      );

      // --- react (for createElement wrapping) ---

      build.onResolve({ filter: /^react$/ }, async (args) => {
        if (args.pluginData?.skipJsxWrapper) {
          return undefined;
        }

        if (!realReactPath) {
          const resolved = await build.resolve(reactModule, {
            kind: args.kind,
            resolveDir: args.resolveDir,
            pluginData: { skipJsxWrapper: true },
          });

          realReactPath = resolved.path;
        }

        return {
          path: 'react',
          namespace: 'react-wrapper',
        };
      });

      build.onResolve({ filter: /^__real_react__$/ }, () => {
        if (!realReactPath) {
          throw new Error(
            'jsx-runtime-remote-wrapper: real react path not resolved yet',
          );
        }

        return { path: realReactPath };
      });

      build.onLoad(
        { filter: /.*/, namespace: 'react-wrapper' },
        () => ({
          contents: REACT_WRAPPER,
          loader: 'js' as const,
        }),
      );

      // --- react-dom aliasing (for Preact compatibility) ---

      if (usePreact) {
        build.onResolve(
          { filter: /^react-dom\/client$/ },
          async (args) => {
            if (!preactCompatPath) {
              const resolved = await build.resolve('preact/compat/client', {
                kind: args.kind,
                resolveDir: args.resolveDir,
              });

              preactCompatPath = resolved.path;
            }

            return { path: preactCompatPath };
          },
        );

        build.onResolve({ filter: /^react-dom$/ }, async (args) => {
          const resolved = await build.resolve('preact/compat', {
            kind: args.kind,
            resolveDir: args.resolveDir,
          });

          return { path: resolved.path };
        });
      }
    },
  };
};

// Default export using React (backward compatible)
export const jsxRuntimeRemoteWrapperPlugin =
  createJsxRuntimeRemoteWrapperPlugin();
