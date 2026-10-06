import type * as esbuild from 'esbuild';

import { JSX_RUNTIME_SHARED_HELPERS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-shared-helpers-source';
import { JSX_RUNTIME_WRAPPER_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-wrapper-source';
import { getReactWrapperSource } from '@/cli/utilities/build/common/front-component-build/utils/get-react-wrapper-source';

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
        contents: JSX_RUNTIME_WRAPPER_SOURCE,
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
        contents: getReactWrapperSource({
          readsElementRefFromVnode: usePreact,
        }),
        loader: 'js' as const,
      }));
    },
  };
};
