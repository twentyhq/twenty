import type * as esbuild from 'esbuild';
import { getCommonFrontComponentBuildOptions } from 'twenty-shared/front-component-build';

import { FRONT_COMPONENT_EXTERNAL_MODULES } from '../constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from './get-front-component-build-plugins';

export const getBaseFrontComponentBuildOptions = (): esbuild.BuildOptions => ({
  ...getCommonFrontComponentBuildOptions(),
  outExtension: { '.js': '.mjs' },
  external: FRONT_COMPONENT_EXTERNAL_MODULES,
  sourcemap: true,
  metafile: true,
  plugins: [...getFrontComponentBuildPlugins()],
});
