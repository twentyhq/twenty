import type * as esbuild from 'esbuild';
import {
  createCssInjectionPlugin,
  createJsxRuntimeRemoteWrapperPlugin,
  createSharedDependenciesShimPlugin,
  type SharedDependenciesBuildContext,
} from 'twenty-shared/front-component-build';
import { isDefined } from 'twenty-shared/utils';

import { getWatchInputPlugins } from '@/app/dev/collect-watch-inputs';
import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { createPreactAliasPlugin } from '../preact-alias-plugin';

type GetFrontComponentBuildPluginsOptions = {
  usePreact?: boolean;
  onSourceFiles?: (paths: string[]) => void;
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
        }),
      ]
    : []),
  createJsxRuntimeRemoteWrapperPlugin(
    options?.usePreact ? { usePreact: true } : undefined,
  ),
  ...(options?.usePreact ? [createPreactAliasPlugin()] : []),
  jsxTransformToRemoteDomWorkerFormatPlugin,
  createCssInjectionPlugin({
    getBuildPlugins: getWatchInputPlugins,
    onSourceFiles: options?.onSourceFiles,
  }),
];
