import path from 'path';
import { type PackageJson } from 'type-fest';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir:
      '../../node_modules/.vite/packages/twenty-front-component-renderer',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
    ],
    worker: {
      format: 'iife',
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      plugins: () => [
        {
          name: 'define-process-env',
          transform: (code: string) =>
            code
              .replace(/process\.env\.NODE_ENV/g, JSON.stringify('production'))
              .replace(/process\.env/g, '{}'),
        },
      ],
    },
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        entry: 'src/index.ts',
        name: 'twenty-front-component-renderer',
      },
      rollupOptions: {
        onwarn: (warning, warn) => {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            warning.message.includes('"use client"')
          ) {
            return;
          }
          warn(warning);
        },
        external: (id: string) => {
          const deps = Object.keys(
            (packageJson as PackageJson).dependencies || {},
          );

          return deps.some((dep) => id === dep || id.startsWith(dep + '/'));
        },
        output: [
          {
            format: 'es',
            entryFileNames: '[name].mjs',
          },
          {
            format: 'cjs',
            interop: 'auto',
            esModule: true,
            exports: 'named',
            entryFileNames: '[name].cjs',
          },
        ],
      },
    },
    logLevel: 'warn',
  };
});
