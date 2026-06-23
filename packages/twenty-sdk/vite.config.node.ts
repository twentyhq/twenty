import fs from 'fs';
import path from 'path';
import { type PackageJson } from 'type-fest';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

const copyCoverAssetsPlugin = () => ({
  name: 'copy-cover-assets',
  closeBundle() {
    const source = path.resolve(
      __dirname,
      'src/cli/utilities/build/cover/assets/halftone-backdrop.png',
    );
    const destinationDir = path.resolve(__dirname, 'dist/assets');

    fs.mkdirSync(destinationDir, { recursive: true });
    fs.copyFileSync(source, path.join(destinationDir, 'halftone-backdrop.png'));
  },
});

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk-node',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
      copyCoverAssetsPlugin(),
    ],
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: {
        entry: {
          cli: 'src/cli/cli.ts',
          operations: 'src/cli/operations/index.ts',
          'front-component-renderer/build':
            'src/front-component-renderer/build/index.ts',
        },
        name: 'twenty-sdk',
      },
      rollupOptions: {
        external: (id: string) => {
          if (/^node:/.test(id)) {
            return true;
          }

          const builtins = [
            'child_process',
            'crypto',
            'fs',
            'fs/promises',
            'module',
            'os',
            'path',
            'stream',
            'url',
            'util',
          ];

          if (builtins.includes(id)) {
            return true;
          }

          const deps = Object.keys(
            (packageJson as PackageJson).dependencies || {},
          );

          return deps.some((dep) => id === dep || id.startsWith(dep + '/'));
        },
        output: [
          {
            format: 'es' as const,
            entryFileNames: '[name].mjs',
          },
          {
            format: 'cjs' as const,
            interop: 'auto' as const,
            esModule: true,
            exports: 'named' as const,
            entryFileNames: '[name].cjs',
          },
        ],
      },
    },
    logLevel: 'warn' as const,
  };
});
