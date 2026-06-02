import path from 'path';
import { type PackageJson } from 'type-fest';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk-front-component',
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
      outDir: 'dist/front-component',
      sourcemap: true,
      lib: {
        entry: 'src/sdk/front-component/index.ts',
        name: 'twenty-sdk-front-component',
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
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
      },
    },
    logLevel: 'warn' as const,
  };
});
