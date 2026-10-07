import { chmod, cp } from 'node:fs/promises';
import { builtinModules } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'vite';

const NODE_BUILTIN_MODULES = new Set([
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
]);

export default defineConfig({
  root: __dirname,
  plugins: [
    {
      name: 'make-cli-executable',
      writeBundle: async () => {
        await chmod(path.resolve(__dirname, 'dist/cli.cjs'), 0o755);
      },
    },
    {
      name: 'copy-app-template',
      closeBundle: async () => {
        await cp(
          path.resolve(
            __dirname,
            '../create-twenty-app/src/constants/template',
          ),
          path.resolve(__dirname, 'dist/app-template'),
          { recursive: true },
        );
        await cp(
          path.resolve(__dirname, 'app-template-overlay'),
          path.resolve(__dirname, 'dist/app-template-overlay'),
          { recursive: true },
        );
      },
    },
  ],
  cacheDir: '../../node_modules/.vite/packages/twenty-cli',
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
      '@create-twenty-app/': `${path.resolve(__dirname, '../create-twenty-app/src')}/`,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'node24',
    lib: {
      entry: {
        cli: 'src/cli.ts',
        'app-worker': 'src/app/worker/app-worker.ts',
      },
      formats: ['cjs'],
    },
    rollupOptions: {
      external: (id: string) =>
        NODE_BUILTIN_MODULES.has(id) ||
        ['chokidar', 'esbuild', 'typescript', 'tinyglobby'].includes(id),
      output: {
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunks/[name]-[hash].cjs',
      },
    },
  },
  logLevel: 'warn',
});
