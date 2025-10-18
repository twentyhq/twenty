import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const moduleEntries = Object.keys((packageJson as any).exports || {})
  .filter((key) => key !== './style.css' && key !== '.' && !key.startsWith('./src/'))
  .map((module) => `src/generated/${module.replace(/^\.\//, '')}/index.ts`);

const entries = ['src/index.ts', ...moduleEntries];

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
  // For generated/metadata/index.ts -> generated/metadata.{extension}
  const parentDir = splitFaceModuleId[splitFaceModuleId?.length - 3];
  if (parentDir === 'generated') {
    return `${parentDir}/${moduleDirectory}.${extension}`;
  }
  return `${moduleDirectory}.${extension}`;
};

export default defineConfig(() => {
  const tsConfigPath = path.resolve(__dirname, './tsconfig.lib.json');

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-sdk',
    plugins: [tsconfigPaths(), dts({ entryRoot: 'src', tsconfigPath: tsConfigPath })],
    build: {
      outDir: 'dist',
      lib: { entry: entries, name: 'twenty-sdk' },
      rollupOptions: {
        external: Object.keys((packageJson as any).dependencies || {}),
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
    logLevel: 'warn'
  };
});

