import type * as esbuild from 'esbuild';
import {
  createJsxRuntimeRemoteWrapperPlugin,
  createSharedDependenciesShimPlugin,
  type SharedDependenciesBuildContext,
} from 'twenty-shared/front-component-build';
import { isDefined } from 'twenty-shared/utils';

import { getSharedDependenciesShimSource } from '../shared-dependencies-build/utils/get-shared-dependencies-shim-source';
import { cssInjectionPlugin } from '../css-injection-plugin';
import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { createPreactAliasPlugin } from '../preact-alias-plugin';

type GetFrontComponentBuildPluginsOptions = {
  usePreact?: boolean;
  getSharedDependenciesBuildContext?: () => SharedDependenciesBuildContext | null;
};

export const getFrontComponentBuildPlugins = (
  options?: GetFrontComponentBuildPluginsOptions,
): esbuild.Plugin[] => [
  ...(isDefined(options?.getSharedDependenciesBuildContext)
    ? [
        createSharedDependenciesShimPlugin({
          getSharedDependenciesBuildContext:
            options.getSharedDependenciesBuildContext,
          getShimSource: getSharedDependenciesShimSource,
        }),
      ]
    : []),
  createJsxRuntimeRemoteWrapperPlugin(
    options?.usePreact ? { usePreact: true } : undefined,
  ),
  ...(options?.usePreact ? [createPreactAliasPlugin()] : []),
  jsxTransformToRemoteDomWorkerFormatPlugin,
  cssInjectionPlugin,
];
