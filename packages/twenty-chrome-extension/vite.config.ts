import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react';

import manifest from './src/manifest';

export default defineConfig(() => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'dist',
      rollupOptions: {
        output: { chunkFileNames: 'assets/chunk-[hash].js' },
      },
    },

    // Adding this to fix websocket connection error.
    server: {
      port: 3002,
      strictPort: true,
      hmr: { port: 3002 },
    },

    plugins: [crx({ manifest }), react()],
  };
});
