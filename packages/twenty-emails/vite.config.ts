import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { APP_LOCALES } from 'twenty-shared/translations';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/twenty-emails',
  logLevel: 'error',

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },

  plugins: [
    react({
      plugins: [['@lingui/swc-plugin', {}]],
      tsDecorators: true,
    }),
    lingui({
      configPath: path.resolve(__dirname, './lingui.config.ts'),
    }),
    tsconfigPaths({
      root: __dirname,
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      compilerOptions: {
        skipLibCheck: true,
      },
      logDiagnostics: false,
      afterDiagnostic: (diagnostics) => {
        // Filter out the lingui type conflict error
        return diagnostics.filter(
          (d) => !d.messageText?.toString().includes('@lingui/core'),
        );
      },
    }),
  ],

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    reportCompressedSize: true,
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        index: 'src/index.ts',
        ...Object.values(APP_LOCALES).reduce(
          (acc, locale) => ({
            ...acc,
            [`locales/generated/${locale}`]: `src/locales/generated/${locale}.ts`,
          }),
          {},
        ),
      },
      name: 'twenty-emails',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
