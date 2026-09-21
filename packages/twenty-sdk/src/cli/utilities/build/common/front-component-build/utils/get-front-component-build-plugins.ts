import type * as esbuild from 'esbuild';
import { isDefined } from 'twenty-shared/utils';

import { createSharedDependenciesShimPlugin } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/create-shared-dependencies-shim-plugin';
import { type SharedDependenciesBuildContext } from '@/cli/utilities/build/common/front-component-build/shared-dependencies-build/types/shared-dependencies-build-context.type';
import { cssInjectionPlugin } from '../css-injection-plugin';
import { createJsxRuntimeRemoteWrapperPlugin } from '../jsx-runtime-remote-wrapper-plugin';
import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { createPreactAliasPlugin } from '../preact-alias-plugin';
import { stripCommentsPlugin } from '../strip-comments-plugin';

type GetFrontComponentBuildPluginsOptions = {
  usePreact?: boolean;
  getSharedDependenciesBuildContext?: () => SharedDependenciesBuildContext | null;
};

export const getFrontComponentBuildPlugins = (
  options?: GetFrontComponentBuildPluginsOptions,
): esbuild.Plugin[] => [
  ...(isDefined(options?.getSharedDependenciesBuildContext)
    ? [
        createSharedDependenciesShimPlugin(
          options.getSharedDependenciesBuildContext,
        ),
      ]
    : []),
  createJsxRuntimeRemoteWrapperPlugin(
    options?.usePreact ? { usePreact: true } : undefined,
  ),
  ...(options?.usePreact ? [createPreactAliasPlugin()] : []),
  jsxTransformToRemoteDomWorkerFormatPlugin,
  cssInjectionPlugin,
  stripCommentsPlugin,
];
