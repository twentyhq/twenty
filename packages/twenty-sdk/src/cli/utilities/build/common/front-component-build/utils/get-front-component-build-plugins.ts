import type * as esbuild from 'esbuild';

import { jsxTransformToRemoteDomWorkerFormatPlugin } from '../jsx-transform-to-remote-dom-worker-format-plugin';
import { reactGlobalsPlugin } from '../react-globals-plugin';

export const getFrontComponentBuildPlugins = (): esbuild.Plugin[] => [
  reactGlobalsPlugin,
  jsxTransformToRemoteDomWorkerFormatPlugin,
];
