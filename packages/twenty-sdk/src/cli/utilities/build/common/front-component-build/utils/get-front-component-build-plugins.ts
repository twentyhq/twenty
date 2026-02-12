import type * as esbuild from 'esbuild';

import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { reactGlobalsPlugin } from '../react-globals-plugin';
import { stripCommentsPlugin } from '../strip-comments-plugin';
import { twentySdkGlobalsPlugin } from '../twenty-sdk-globals-plugin';
import { twentySdkUiGlobalsPlugin } from '../twenty-sdk-ui-globals-plugin';
import { twentySharedGlobalsPlugin } from '../twenty-shared-globals-plugin';

export const getFrontComponentBuildPlugins = (): esbuild.Plugin[] => [
  reactGlobalsPlugin,
  twentySdkGlobalsPlugin,
  twentySdkUiGlobalsPlugin,
  twentySharedGlobalsPlugin,
  jsxTransformToRemoteDomWorkerFormatPlugin,
  stripCommentsPlugin,
];
