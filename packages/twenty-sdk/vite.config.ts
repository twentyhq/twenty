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
  return `${moduleDirectory}.${extension}`;
};

const copySharedDist = () => {
  return {
    name: 'copy-twenty-shared-dist',
    closeBundle: async () => {
      const sharedDist = path.resolve(__dirname, '../twenty-shared/dist');
      const vendorDist = path.resolve(__dirname, 'dist/vendor/twenty-shared');

      await fs.remove(vendorDist);
      await fs.ensureDir(path.dirname(vendorDist));
      await fs.copy(sharedDist, vendorDist);
    },
  };
};

export default defineConfig(() => {
  const tsConfigPath = path.resolve(__dirname, './tsconfig.lib.json');

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk',
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
      copySharedDist(),
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

          return {
            filePath,
            content: content.replace(
              /(from\s+["'])twenty-shared(\/[^"']*)?(["'])/g,
              `$1${rel}/twenty-shared$2$3`,
            ),
          };
        },
      }),
    ],
    build: {
      outDir: 'dist',
      lib: { entry: entries, name: 'twenty-sdk' },
      rollupOptions: {
        external: [
          ...Object.keys((packageJson as any).dependencies || {}),
          'path',
          'fs',
          'crypto',
          'stream',
          'util',
          'os',
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
  };
});
