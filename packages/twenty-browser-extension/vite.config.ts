import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/chrome-mv3-dev/'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/entrypoints/iframe/index.html'),
      output: {
        entryFileNames: 'main.js',
      },
    },
  },
});
