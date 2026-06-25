import type * as esbuild from 'esbuild';

import { CSS_IMPORT_LOADER } from '@/cli/utilities/build/common/css-import-loader';

import { FRONT_COMPONENT_EXTERNAL_MODULES } from '../constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from './get-front-component-build-plugins';

export const getBaseFrontComponentBuildOptions = (): esbuild.BuildOptions => ({
  bundle: true,
  splitting: false,
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  external: FRONT_COMPONENT_EXTERNAL_MODULES,
  loader: CSS_IMPORT_LOADER,
  jsx: 'automatic',
  sourcemap: true,
  metafile: true,
  logLevel: 'silent',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [...getFrontComponentBuildPlugins()],
});
