import type * as esbuild from 'esbuild';

import { cssInjectionPlugin } from '../css-injection-plugin';
import { createFrontComponentRequireShimPlugin } from '../front-component-require-shim-plugin';
import { createJsxRuntimeRemoteWrapperPlugin } from '../jsx-runtime-remote-wrapper-plugin';
import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { createPreactAliasPlugin } from '../preact-alias-plugin';
import { stripCommentsPlugin } from '../strip-comments-plugin';

type GetFrontComponentBuildPluginsOptions = {
  usePreact?: boolean;
};

export const getFrontComponentBuildPlugins = (
  options?: GetFrontComponentBuildPluginsOptions,
): esbuild.Plugin[] => [
  createJsxRuntimeRemoteWrapperPlugin(
    options?.usePreact ? { usePreact: true } : undefined,
  ),
  ...(options?.usePreact
    ? [createPreactAliasPlugin(), createFrontComponentRequireShimPlugin()]
    : []),
  jsxTransformToRemoteDomWorkerFormatPlugin,
  cssInjectionPlugin,
  stripCommentsPlugin,
];
