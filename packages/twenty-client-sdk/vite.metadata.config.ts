import path from 'path';
import { defineConfig } from 'vite';

import { entryFileNames, isExternal } from './vite.shared';

// Built as its own single-entry library so the metadata entrypoint is a single
// self-contained file, instead of sharing a chunk-*.mjs with the other entries
// in the main multi-entry build (vite.config.ts). emptyOutDir: false so it
// writes alongside that build's output rather than wiping it.
export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-client-sdk-metadata',
    resolve: {
      tsconfigPaths: true,
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: { entry: 'src/metadata/index.ts', name: 'twenty-client-sdk' },
      rollupOptions: {
        external: isExternal,
        output: [
          {
            format: 'es',
            entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
          },
          {
            format: 'cjs',
            esModule: true,
            exports: 'named',
            entryFileNames: (chunk) => entryFileNames(chunk, 'cjs'),
          },
        ],
      },
    },
    logLevel: 'warn',
  };
});
