import type * as esbuild from 'esbuild';

import {
  createJsxRuntimeRemoteWrapperPlugin,
  jsxRuntimeRemoteWrapperPlugin,
} from '../jsx-runtime-remote-wrapper-plugin';
import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { stripCommentsPlugin } from '../strip-comments-plugin';

type GetFrontComponentBuildPluginsOptions = {
  usePreact?: boolean;
};

export const getFrontComponentBuildPlugins = (
  options?: GetFrontComponentBuildPluginsOptions,
): esbuild.Plugin[] => [
  options?.usePreact
    ? createJsxRuntimeRemoteWrapperPlugin({ usePreact: true })
    : jsxRuntimeRemoteWrapperPlugin,
  jsxTransformToRemoteDomWorkerFormatPlugin,
  stripCommentsPlugin,
];
