import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node14', // Specify the Node.js target version
    outDir: 'dist/packages/twenty-postgres-proxy',
    rollupOptions: {
      input: resolve(__dirname, 'src/main.ts'), // Specify the entry point
      external: ['net', 'dotenv', 'minimatch'],
      output: {
        format: 'cjs',
      },
    },
    sourcemap: true,
  },
  esbuild: {
    sourcemap: true,
  },
});
