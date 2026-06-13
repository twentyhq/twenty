import { builtinModules } from 'node:module';

import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { APP_LOCALES } from 'twenty-shared/translations';
import { defineConfig, type Plugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// twenty-emails is bundled (deps included) but consumed by the Node server.
// In a client/lib build Vite 8 (rolldown) resolves node builtins to browser
// stubs that throw at runtime (e.g. object-inspect reading util.inspect.custom),
// which crashes the server on import. Mark builtins external in a `pre` resolver
// so they stay real `require('node:util')` calls instead of being stubbed —
// this runs before Vite's builtin-stub resolver and only touches builtins, so
// the react-email dependencies still get bundled in.
const nodeBuiltins = new Set([
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
]);

const externalizeNodeBuiltins = (): Plugin => ({
  name: 'externalize-node-builtins',
  enforce: 'pre',
  resolveId(source) {
    const specifier = source.startsWith('node:') ? source : `node:${source}`;

    if (nodeBuiltins.has(source) || nodeBuiltins.has(specifier)) {
      return { id: specifier, external: true };
    }

    return null;
  },
});

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/twenty-emails',

  resolve: {
    alias: {
      '@/': path.resolve(__dirname, 'src') + '/',
      'src/': path.resolve(__dirname, 'src') + '/',
    },
  },

  plugins: [
    externalizeNodeBuiltins(),
    react({
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    lingui({
      configPath: path.resolve(__dirname, './lingui.config.ts'),
    }),
    tsconfigPaths({
      root: __dirname,
    }),
  ],

  build: {
    outDir: './dist',
    reportCompressedSize: false,
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
      // Build for the Node platform so rolldown (Vite 8) keeps node builtins
      // as real externals instead of browser-compat stubs that throw at runtime.
      platform: 'node',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
