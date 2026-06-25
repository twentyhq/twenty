import type * as esbuild from 'esbuild';

export const CSS_IMPORT_LOADER: Record<string, esbuild.Loader> = {
  '.css': 'empty',
};
