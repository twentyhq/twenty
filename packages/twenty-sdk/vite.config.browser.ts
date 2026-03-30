import path from 'path';
import { type PackageJson } from 'type-fest';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk-browser',
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
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        entry: ['src/ui/index.ts', 'src/front-component-renderer/index.ts'],
        name: 'twenty-sdk',
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
            entryFileNames: (chunk) => {
              if (
                chunk.name === 'index' &&
                chunk.facadeModuleId?.includes('ui/index.ts')
              ) {
                return 'ui/index.mjs';
              }
              if (
                chunk.facadeModuleId?.includes(
                  'front-component-renderer/index.ts',
                )
              ) {
                return 'front-component-renderer.mjs';
              }
              return '[name].mjs';
            },
          },
          {
            format: 'cjs',
            interop: 'auto',
            esModule: true,
            exports: 'named',
            entryFileNames: (chunk) => {
              if (
                chunk.name === 'index' &&
                chunk.facadeModuleId?.includes('ui/index.ts')
              ) {
                return 'ui/index.cjs';
              }
              if (
                chunk.facadeModuleId?.includes(
                  'front-component-renderer/index.ts',
                )
              ) {
                return 'front-component-renderer.cjs';
              }
              return '[name].cjs';
            },
          },
        ],
      },
    },
    logLevel: 'warn',
  };
});
