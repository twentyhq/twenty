import type * as esbuild from 'esbuild';

import { FRONT_COMPONENT_EXTERNAL_MODULES } from '../constants/front-component-external-modules';
import { getFrontComponentBuildPlugins } from './get-front-component-build-plugins';

type CreateFrontComponentBuildOptionsParams = {
  entryPoints: esbuild.BuildOptions['entryPoints'];
  outdir: string;
  tsconfigPath?: string;
  usePreact?: boolean;
  minify?: boolean;
  alias?: Record<string, string>;
  plugins?: esbuild.Plugin[];
};

export const createFrontComponentBuildOptions = ({
  entryPoints,
  outdir,
  tsconfigPath,
  usePreact = false,
  minify = false,
  alias,
  plugins = [],
}: CreateFrontComponentBuildOptionsParams): esbuild.BuildOptions => ({
  entryPoints,
  bundle: true,
  splitting: false,
  format: 'esm',
  outdir,
  outExtension: { '.js': '.mjs' },
  external: FRONT_COMPONENT_EXTERNAL_MODULES,
  tsconfig: tsconfigPath,
  jsx: 'automatic',
  sourcemap: true,
  metafile: true,
  logLevel: 'silent',
  minify,
  alias,
  plugins: [...getFrontComponentBuildPlugins({ usePreact }), ...plugins],
});
