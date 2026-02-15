import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type * as esbuild from 'esbuild';

import { FRONT_COMPONENT_EXTERNAL_MODULES } from '../../../src/cli/utilities/build/common/front-component-build/constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from '../../../src/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const twentyUiIndividualIndex = path.resolve(
  dirname,
  '../../../../twenty-ui/dist/individual/index.js',
);

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
  usePreact?: boolean;
};

export const createFrontComponentBuildOptions = ({
  entryPoints,
  outdir,
  tsconfigPath,
  externalModules = FRONT_COMPONENT_EXTERNAL_MODULES,
  logLevel = 'silent',
  platform,
  minify = true,
  metafile = true,
  sourcemap = true,
  usePreact = false,
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
    alias: {
      'twenty-sdk/ui': twentyUiIndividualIndex,
    },
    plugins: getFrontComponentBuildPlugins({ usePreact }),
  };
};
