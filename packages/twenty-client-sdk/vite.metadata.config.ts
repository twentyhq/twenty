import path from 'path';
import { defineConfig } from 'vite';

import { entryFileNames, isExternal } from './vite.shared';

// The metadata client is served to front components by the renderer, which
// loads each SDK client as a single blob-URL module and cannot resolve relative
// chunk imports. Building it as its own single-entry library guarantees a single
// self-contained file (no shared chunk-*.mjs), unlike the main multi-entry build
// in vite.config.ts. Writes dist/metadata.{mjs,cjs} alongside that build's output
// (emptyOutDir: false so it doesn't wipe it).
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
            interop: 'auto',
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
