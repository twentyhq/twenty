import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: './',
  // Packaged Electron releases contain large HTML license files, not app entry points.
  optimizeDeps: { entries: ['index.html'] },
  plugins: [svgr()],
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
  build: { outDir: 'dist/renderer', emptyOutDir: true },
  server: {
    host: '127.0.0.1',
    port: 4317,
    strictPort: true,
    watch: { ignored: ['**/release/**', '**/dist/**'] },
  },
});
