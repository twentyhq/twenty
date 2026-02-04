import * as fs from 'fs-extra';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const moduleEntries = Object.keys((packageJson as any).exports || {})
  .filter((key) => key !== '.' && !key.startsWith('./src/'))
  .map((module) => `src/${module.replace(/^\.\//, '')}/index.ts`);

const entries = ['src/index.ts', 'src/cli/cli.ts', ...moduleEntries];

export const PACKAGES_TO_VENDOR = ['twenty-ui', 'twenty-shared'];

const entryFileNames = (chunk: any, extension: 'cjs' | 'mjs') => {
  if (!chunk.isEntry) {
    throw new Error(
      `Should never occurs, encountered a non entry chunk ${chunk.facadeModuleId}`,
    );
  }

  const splitFaceModuleId = chunk.facadeModuleId?.split('/');
  if (splitFaceModuleId === undefined) {
    throw new Error(
      `Should never occurs splitFaceModuleId is undefined ${chunk.facadeModuleId}`,
    );
  }

  const moduleDirectory = splitFaceModuleId[splitFaceModuleId?.length - 2];
  if (moduleDirectory === 'src') {
    return `${chunk.name}.${extension}`;
  }
  return `${moduleDirectory}/index.${extension}`;
};

const copyTwentyPackagesInVendor = (packages: string[]) => {
  return packages.map((packageName) => ({
    name: `copy-${packageName}-dist`,
    closeBundle: async () => {
      const sharedDist = path.resolve(__dirname, `../${packageName}/dist`);
      const vendorDist = path.resolve(__dirname, `dist/vendor/${packageName}`);

      await fs.remove(vendorDist);
      await fs.ensureDir(path.dirname(vendorDist));
      await fs.copy(sharedDist, vendorDist);
    },
  }));
};

export default defineConfig(() => {
  const tsConfigPath = path.resolve(__dirname, './tsconfig.lib.json');

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
      ...copyTwentyPackagesInVendor(PACKAGES_TO_VENDOR),
      dts({
        entryRoot: './src',
        tsconfigPath: tsConfigPath,
        exclude: ['vite.config.ts'],
        beforeWriteFile: (filePath, content) => {
          const fromDir = path.dirname(filePath);
          const vendorDir = path.resolve(process.cwd(), 'dist/vendor');

          let rel = path
            .relative(fromDir, vendorDir)
            .split(path.sep)
            .join(path.posix.sep);
          if (!rel.startsWith('.')) rel = `./${rel}`;

          const formattedContent = PACKAGES_TO_VENDOR.reduce((acc, pkg) => {
            const regex = new RegExp(
              `(from\\s+["'])${pkg}(\\/[^"']*)?(["'])`,
              'g',
            );

            return acc.replace(regex, `$1${rel}/${pkg}$2$3`);
          }, content);

          return {
            filePath,
            content: formattedContent,
          };
        },
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
      outDir: 'dist',
      lib: { entry: entries, name: 'twenty-sdk' },
      rollupOptions: {
        onwarn: (warning, warn) => {
          // Suppress "use client" directive warnings from framer-motion
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            warning.message.includes('"use client"')
          ) {
            return;
          }
          warn(warning);
        },
        external: [
          ...Object.keys((packageJson as any).dependencies || {}).filter(
            (dep) => !PACKAGES_TO_VENDOR.includes(dep),
          ),
          'path',
          'fs',
          'fs/promises',
          'url',
          'crypto',
          'stream',
          'util',
          'os',
          'module',
          /^node:/,
        ],
        output: [
          {
            format: 'es',
            entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
          },
          {
            format: 'cjs',
            interop: 'auto',
            esModule: true,
            exports: 'named',
            entryFileNames: (chunk) => entryFileNames(chunk, 'cjs'),
          },
        ],
      },
    },
    logLevel: 'warn',
    optimizeDeps: {
      include: [
        '@remote-dom/core/polyfill',
        '@remote-dom/react/polyfill',
        '@remote-dom/core/elements',
        '@remote-dom/react',
        '@remote-dom/react/host',
        'react-dom/client',
        'react/jsx-runtime',
      ],
    },
  };
});
