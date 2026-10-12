import type * as esbuild from 'esbuild';

import jsxRuntimeWrapperSource from '@/cli/utilities/build/common/front-component-build/jsx-runtime/jsx-runtime-wrapper.ts?source';
import jsxSharedHelpersSource from '@/cli/utilities/build/common/front-component-build/jsx-runtime/jsx-shared-helpers.ts?source';
import reactWrapperSource from '@/cli/utilities/build/common/front-component-build/jsx-runtime/react-wrapper.ts?source';

type JsxRuntimeRemoteWrapperPluginOptions = {
  usePreact?: boolean;
};

export const createJsxRuntimeRemoteWrapperPlugin = (
  options?: JsxRuntimeRemoteWrapperPluginOptions,
): esbuild.Plugin => {
  const usePreact = options?.usePreact ?? false;

  const jsxRuntimeModule = usePreact
    ? 'preact/compat/jsx-runtime'
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
        contents: jsxSharedHelpersSource,
        loader: 'js' as const,
      }));

      build.onResolve({ filter: /^__reads_element_ref_from_vnode__$/ }, () => ({
        path: '__reads_element_ref_from_vnode__',
        namespace: 'reads-element-ref-from-vnode',
      }));

      build.onLoad(
        { filter: /.*/, namespace: 'reads-element-ref-from-vnode' },
        () => ({
          contents: `export const READS_ELEMENT_REF_FROM_VNODE = ${usePreact};`,
          loader: 'js' as const,
        }),
      );

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
        contents: jsxRuntimeWrapperSource,
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
        contents: reactWrapperSource,
        loader: 'js' as const,
      }));
    },
  };
};
