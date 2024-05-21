import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import manifest from './src/manifest';

const viteManifestHack: Plugin & {
  renderCrxManifest: (manifest: unknown, bundle: unknown) => void;
} = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHack',
  renderCrxManifest: (_manifest, bundle: any) => {
    bundle['manifest.json'] = bundle['.vite/manifest.json'];
    bundle['manifest.json'].fileName = 'manifest.json';
    delete bundle['.vite/manifest.json'];
  },
};

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-chrome-extension',

    build: {
      emptyOutDir: true,
      outDir: 'dist',
      rollupOptions: {
        output: { chunkFileNames: 'assets/chunk-[hash].js' },
      },
      target: 'ES2022',
    },

    // Adding this to fix websocket connection error.
    server: {
      port: 3002,
      strictPort: true,
      hmr: { port: 3002 },
    },

    plugins: [viteManifestHack, crx({ manifest }), react(), tsconfigPaths()],
  };
});
