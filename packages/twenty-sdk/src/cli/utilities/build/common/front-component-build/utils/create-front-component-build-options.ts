import type * as esbuild from 'esbuild';

import { FRONT_COMPONENT_EXTERNAL_MODULES } from '../constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from './get-front-component-build-plugins';

export type FrontComponentBuildOptions = {
  entryPoints: esbuild.BuildOptions['entryPoints'];
  outdir: string;
  tsconfigPath?: string;
  externalModules?: string[];
  logLevel?: esbuild.LogLevel;
  platform?: esbuild.Platform;
  minify?: boolean;
  metafile?: boolean;
  sourcemap?: boolean;
};

export const createFrontComponentBuildOptions = ({
  entryPoints,
  outdir,
  tsconfigPath,
  externalModules = FRONT_COMPONENT_EXTERNAL_MODULES,
  logLevel = 'silent',
  platform,
  minify,
  metafile = true,
  sourcemap = true,
}: FrontComponentBuildOptions): esbuild.BuildOptions => {
  return {
    entryPoints,
    bundle: true,
    splitting: false,
    format: 'esm',
    platform,
    outdir,
    outExtension: { '.js': '.mjs' },
    external: externalModules,
    tsconfig: tsconfigPath,
    jsx: 'automatic',
    sourcemap,
    metafile,
    logLevel,
    minify,
    plugins: getFrontComponentBuildPlugins(),
  };
};
