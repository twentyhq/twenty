import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: './',
  plugins: [svgr()],
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
    preprocessorOptions: {
      scss: {
        loadPaths: [
          fileURLToPath(new URL('../twenty-ui/src/styles', import.meta.url)),
        ],
        additionalData:
          "@use 'abstracts/functions' as *;\n@use 'abstracts/mixins' as *;\n@use 'abstracts/breakpoints' as *;\n",
      },
    },
  },
  resolve: {
    alias: {
      'twenty-ui/icon': fileURLToPath(
        new URL('../twenty-ui/src/icon/index.ts', import.meta.url),
      ),
      '@assets': fileURLToPath(
        new URL('../twenty-ui/src/assets', import.meta.url),
      ),
      '@ui': fileURLToPath(new URL('../twenty-ui/src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  build: { outDir: 'dist/renderer', emptyOutDir: true },
  server: { host: '127.0.0.1', port: 4317, strictPort: true },
});
