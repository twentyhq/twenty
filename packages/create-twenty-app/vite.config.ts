import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    target: 'node24',
    lib: {
      entry: 'src/cli.ts',
      formats: ['cjs'],
      fileName: () => 'cli.cjs',
    },
  },
});
