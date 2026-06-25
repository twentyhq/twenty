import { builtinModules } from 'node:module';

import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { APP_LOCALES } from 'twenty-shared/translations';
import { defineConfig, type Plugin } from 'vite';

// twenty-emails bundles its deps (the Node server that consumes it doesn't have
// @react-email et al.) but runs in Node. A plain client/lib build under Vite 8
// (rolldown) resolves node builtins to browser stubs that throw at runtime
// (e.g. object-inspect reading util.inspect.custom), crashing the server on
// import. Vite only externalizes builtins as real `require('node:*')` in an
// SSR/node build, so this is built with `build.ssr` + `ssr.target: 'node'`,
// while `ssr.noExternal: true` keeps the npm deps bundled in. React stays
// external as the host app provides it.
const EXTERNAL_DEPENDENCIES = ['react', 'react-dom', 'react/jsx-runtime'];

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
    tsconfigPaths: true,
    alias: {
      '@/': path.resolve(__dirname, 'src') + '/',
      'src/': path.resolve(__dirname, 'src') + '/',
    },
  },

  ssr: {
    target: 'node',
    noExternal: true,
    external: EXTERNAL_DEPENDENCIES,
  },

  plugins: [
    externalizeNodeBuiltins(),
    react({
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    lingui({
      configPath: path.resolve(__dirname, './lingui.config.ts'),
    }),
  ],

  build: {
    outDir: './dist',
    ssr: true,
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
      external: EXTERNAL_DEPENDENCIES,
    },
  },
});
