import type * as esbuild from 'esbuild';
import { dirname } from 'node:path';
import { isDefined } from 'twenty-shared/utils';

import { JSX_RUNTIME_SHARED_HELPERS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-shared-helpers-source';
import { PREACT_REF_COMPAT_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/preact-ref-compat-source';

const JSX_RUNTIME_WRAPPER = `
import {
  jsx as _originalJsx,
  jsxs as _originalJsxs,
  Fragment,
} from '__real_react_jsx_runtime__';

import {
  customElementMap,
  injectStyleViaHead,
  extractCssText,
  withJsxEventRef,
} from '__jsx_shared_helpers__';

function _wrapJsxFactory(originalFactory) {
  return function wrappedJsx(type, props, key) {
    if (typeof type === 'string') {
      if (type === 'style') {
        var css =
          props && props.dangerouslySetInnerHTML
            ? props.dangerouslySetInnerHTML.__html || ''
            : extractCssText(props && props.children);
        injectStyleViaHead(css);
        return null;
      }

      var customTag = customElementMap[type];
      if (customTag) {
        return originalFactory(customTag, withJsxEventRef(props), key);
      }
    }
    return originalFactory(type, props, key);
  };
}

export var jsx = _wrapJsxFactory(_originalJsx);
export var jsxs = _wrapJsxFactory(_originalJsxs);
export { Fragment };
`.trim();

const createReactWrapper = ({
  readsElementRefFromVnode,
}: {
  readsElementRefFromVnode: boolean;
}) =>
  `
export * from '__real_react__';
import _React from '__real_react__';
${readsElementRefFromVnode ? "import { normalizeClonedFunctionRef } from '__preact_ref_compat__';" : ''}

import {
  customElementMap,
  injectStyleViaHead,
  extractCssText,
  withJsxEventRef,
  withCloneEventRef,
  isCustomElementTag,
} from '__jsx_shared_helpers__';

var _originalCreateElement = _React.createElement;
var _originalCloneElement = _React.cloneElement;
var _readsElementRefFromVnode = ${readsElementRefFromVnode};

function createElement(type) {
  var args = arguments;
  if (typeof type === 'string') {
    if (type === 'style') {
      var props = args.length > 1 ? args[1] : null;
      if (props) {
        var css = props.dangerouslySetInnerHTML
          ? props.dangerouslySetInnerHTML.__html || ''
          : extractCssText(props.children);
        injectStyleViaHead(css);
      }
      return null;
    }

    var customTag = customElementMap[type];
    if (customTag) {
      var newArgs = [customTag, withJsxEventRef(args.length > 1 ? args[1] : null)];
      for (var i = 2; i < args.length; i++) newArgs.push(args[i]);
      return _originalCreateElement.apply(null, newArgs);
    }
  }
  return _originalCreateElement.apply(null, args);
}

function cloneElement(element) {
  var args = arguments;
  if (!element || !isCustomElementTag(element.type)) {
    ${
      readsElementRefFromVnode
        ? `return normalizeClonedFunctionRef({
      vnode: _originalCloneElement.apply(null, args),
      config: args[1],
    });`
        : 'return _originalCloneElement.apply(null, args);'
    }
  }
  var newArgs = [
    element,
    withCloneEventRef(
      element,
      args.length > 1 ? args[1] : null,
      _readsElementRefFromVnode,
    ),
  ];
  for (var i = 2; i < args.length; i++) newArgs.push(args[i]);
  return _originalCloneElement.apply(null, newArgs);
}

export { createElement, cloneElement };
export default Object.assign({}, _React, {
  createElement: createElement,
  cloneElement: cloneElement,
});
`.trim();

type JsxRuntimeRemoteWrapperPluginOptions = {
  usePreact?: boolean;
};

export const createJsxRuntimeRemoteWrapperPlugin = (
  options?: JsxRuntimeRemoteWrapperPluginOptions,
): esbuild.Plugin => {
  const usePreact = options?.usePreact ?? false;

  const jsxRuntimeModule = usePreact
    ? 'preact/jsx-runtime'
    : 'react/jsx-runtime';
  const reactModule = usePreact ? 'preact/compat' : 'react';

  return {
    name: 'jsx-runtime-remote-wrapper',
    setup: (build) => {
      let realJsxRuntimePath: string | undefined;
      let realReactPath: string | undefined;
      const refCompatImport = usePreact
        ? "import '__preact_ref_compat__';\n"
        : '';

      build.onResolve({ filter: /^__preact_ref_compat__$/ }, () => ({
        path: '__preact_ref_compat__',
        namespace: 'preact-ref-compat',
      }));

      build.onLoad({ filter: /.*/, namespace: 'preact-ref-compat' }, () => {
        const realRuntimePath = realJsxRuntimePath ?? realReactPath;

        if (!isDefined(realRuntimePath)) {
          throw new Error('Preact runtime path has not been resolved');
        }

        return {
          contents: PREACT_REF_COMPAT_SOURCE,
          loader: 'js' as const,
          resolveDir: dirname(realRuntimePath),
        };
      });

      build.onResolve({ filter: /^__jsx_shared_helpers__$/ }, () => ({
        path: '__jsx_shared_helpers__',
        namespace: 'jsx-shared-helpers',
      }));

      build.onLoad({ filter: /.*/, namespace: 'jsx-shared-helpers' }, () => ({
        contents: JSX_RUNTIME_SHARED_HELPERS_SOURCE,
        loader: 'js' as const,
      }));

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

      build.onLoad({ filter: /.*/, namespace: 'jsx-runtime-wrapper' }, () => ({
        contents: refCompatImport + JSX_RUNTIME_WRAPPER,
        loader: 'js' as const,
      }));

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

      build.onLoad({ filter: /.*/, namespace: 'react-wrapper' }, () => ({
        contents:
          refCompatImport +
          createReactWrapper({ readsElementRefFromVnode: usePreact }),
        loader: 'js' as const,
      }));
    },
  };
};
