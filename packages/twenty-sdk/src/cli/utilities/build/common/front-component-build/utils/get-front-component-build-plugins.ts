import type * as esbuild from 'esbuild';

import { jsxRuntimeRemoteWrapperPlugin } from '../jsx-runtime-remote-wrapper-plugin';
import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { stripCommentsPlugin } from '../strip-comments-plugin';
import { twentySdkGlobalsPlugin } from '../twenty-sdk-globals-plugin';
import { twentySharedGlobalsPlugin } from '../twenty-shared-globals-plugin';

export const getFrontComponentBuildPlugins = (): esbuild.Plugin[] => [
  jsxRuntimeRemoteWrapperPlugin,
  twentySdkGlobalsPlugin,
  twentySharedGlobalsPlugin,
  jsxTransformToRemoteDomWorkerFormatPlugin,
  stripCommentsPlugin,
];
