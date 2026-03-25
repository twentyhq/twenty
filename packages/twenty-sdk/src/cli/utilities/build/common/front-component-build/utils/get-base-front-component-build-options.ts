import type * as esbuild from 'esbuild';

import { FRONT_COMPONENT_EXTERNAL_MODULES } from '../constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from './get-front-component-build-plugins';

export const getBaseFrontComponentBuildOptions = (): esbuild.BuildOptions => ({
  bundle: true,
  splitting: false,
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: FRONT_COMPONENT_EXTERNAL_MODULES,
  jsx: 'automatic',
  sourcemap: true,
  metafile: true,
  logLevel: 'silent',
  plugins: [...getFrontComponentBuildPlugins()],
});
