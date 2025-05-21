/* eslint-disable no-console */
import { lingui } from '@lingui/vite-plugin';
import { isNonEmptyString } from '@sniptt/guards';
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import fs from 'fs';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv, PluginOption, searchForWorkspaceRoot } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

type Checkers = Parameters<typeof checker>[0];

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const {
    REACT_APP_SERVER_BASE_URL,
    VITE_BUILD_SOURCEMAP,
    VITE_DISABLE_TYPESCRIPT_CHECKER,
    VITE_DISABLE_ESLINT_CHECKER,
    VITE_HOST,
    SSL_CERT_PATH,
    SSL_KEY_PATH,
    REACT_APP_PORT,
  } = env;

  const port = isNonEmptyString(REACT_APP_PORT)
    ? parseInt(REACT_APP_PORT)
    : 3001;

  const isBuildCommand = command === 'build';

  const tsConfigPath = isBuildCommand
    ? path.resolve(__dirname, './tsconfig.build.json')
    : path.resolve(__dirname, './tsconfig.dev.json');

  const checkers: Checkers = {
    overlay: false,
  };

  if (VITE_DISABLE_TYPESCRIPT_CHECKER === 'true') {
    console.log(
      `VITE_DISABLE_TYPESCRIPT_CHECKER: ${VITE_DISABLE_TYPESCRIPT_CHECKER}`,
    );
  }

  if (VITE_DISABLE_ESLINT_CHECKER === 'true') {
    console.log(`VITE_DISABLE_ESLINT_CHECKER: ${VITE_DISABLE_ESLINT_CHECKER}`);
  }

  if (VITE_BUILD_SOURCEMAP === 'true') {
    console.log(`VITE_BUILD_SOURCEMAP: ${VITE_BUILD_SOURCEMAP}`);
  }

  if (VITE_DISABLE_TYPESCRIPT_CHECKER !== 'true') {
    checkers['typescript'] = {
      tsconfigPath: tsConfigPath,
    };
  }

  if (VITE_DISABLE_ESLINT_CHECKER !== 'true') {
    checkers['eslint'] = {
      lintCommand:
        // Appended to packages/twenty-front/.eslintrc.cjs
        'eslint ../../packages/twenty-front --report-unused-disable-directives --max-warnings 0 --config .eslintrc.cjs',
    };
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-front',

    server: {
      port: port,
      ...(VITE_HOST ? { host: VITE_HOST } : {}),
      ...(SSL_KEY_PATH && SSL_CERT_PATH
        ? {
            protocol: 'https',
            https: {
              key: fs.readFileSync(env.SSL_KEY_PATH),
              cert: fs.readFileSync(env.SSL_CERT_PATH),
            },
          }
        : {
            protocol: 'http',
          }),
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          '**/@blocknote/core/src/fonts/**',
        ],
      },
    },

    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [['@lingui/swc-plugin', {}]],
      }),
      tsconfigPaths({
        projects: ['tsconfig.json'],
      }),
      svgr(),
      lingui({
        configPath: path.resolve(__dirname, './lingui.config.ts'),
      }),
      checker(checkers),
      // TODO: fix this, we have to restrict the include to only the components that are using linaria
      // Otherwise the build will fail because wyw tries to include emotion styled components
      wyw({
        include: [
          '**/CurrencyDisplay.tsx',
          '**/EllipsisDisplay.tsx',
          '**/ContactLink.tsx',
          '**/BooleanDisplay.tsx',
          '**/LinksDisplay.tsx',
          '**/RoundedLink.tsx',
          '**/OverflowingTextWithTooltip.tsx',
          '**/Chip.tsx',
          '**/Tag.tsx',
          '**/MultiSelectFieldDisplay.tsx',
          '**/RatingInput.tsx',
          '**/RecordTableCellContainer.tsx',
          '**/RecordTableCellDisplayContainer.tsx',
          '**/Avatar.tsx',
          '**/RecordTableBodyDroppable.tsx',
          '**/RecordTableCellBaseContainer.tsx',
          '**/RecordTableCellTd.tsx',
          '**/RecordTableTd.tsx',
          '**/RecordTableHeaderDragDropColumn.tsx',
          '**/ActorDisplay.tsx',
          '**/BooleanDisplay.tsx',
          '**/CurrencyDisplay.tsx',
          '**/TextDisplay.tsx',
          '**/EllipsisDisplay.tsx',
          '**/AvatarChip.tsx',
          '**/URLDisplay.tsx',
          '**/EmailsDisplay.tsx',
          '**/PhonesDisplay.tsx',
          '**/MultiSelectDisplay.tsx',
        ],
        babelOptions: {
          presets: ['@babel/preset-typescript', '@babel/preset-react'],
        },
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      }) as PluginOption // https://github.com/btd/rollup-plugin-visualizer/issues/162#issuecomment-1538265997,
    ],

    optimizeDeps: {
      exclude: [
        '../../node_modules/.vite',
        '../../node_modules/.cache',
        '../../node_modules/twenty-ui',
      ],
    },

    build: {
      minify: 'esbuild',
      outDir: 'build',
      sourcemap: VITE_BUILD_SOURCEMAP === 'true',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('/modules/settings/')) return 'settings';

            if (!id.includes('node_modules')) {
              return null;
            }

            if (id.includes('typescript/lib/typescript.js')) {
              return 'typescript-lib';
            }
            
            if (id.includes('shiki')) {
              if (id.includes('/langs/typescript.mjs') || id.includes('/langs/json.mjs')) {
                return 'shiki-supported-langs';
              }
              if (id.includes('/langs/')) {
                return 'not-loaded';
              }
              return 'shiki-core';
            }

            if (id.includes('monaco-editor')) {

              if (id.includes('/basic-languages/') && id.includes('typescript')) {
                return 'monaco-core';
              }
              if (id.includes('/basic-languages/')) {
                return 'not-loaded';
              }

              return 'monaco-core';
            }

              // React and React DOM should be in the same chunk to avoid initialization issues
              if (id.includes('react') || id.includes('react-dom') || id.includes('@nivo')) {
                return 'react-vendor';
              }
              
              // Other vendor chunks
              if (id.includes('@scalar')) return 'scalar';
              if (id.includes('twenty-ui')) return 'twenty-ui';
              if (id.includes('react-router')) return 'react-router';
              if (id.includes('@apollo')) return 'apollo';
              if (id.includes('@lingui')) return 'lingui';
              // if (id.includes('@nivo')) return 'nivo';
              if (id.includes('recoil')) return 'recoil';
              if (id.includes('@tiptap')) return 'tiptap';
              if (id.includes('@blocknote')) return 'blocknote';
              if (id.includes('@react-pdf')) return 'react-pdf';
              if (id.includes('xlsx-ugnis')) return 'xlsx-ugnis';
              if (id.includes('@sentry')) return 'sentry';
              
              return null;
          },
        },
      },
      external: ['react', 'react-dom'],
      modulePreload: {
        resolveDependencies: (filename, deps, { hostId }) => {
            // Don't preload heavy chunks that aren't needed immediately
            return deps.filter(dep => 
              !dep.includes('scalar') &&
              !dep.includes('tiptap') &&
              !dep.includes('react-pdf') &&
              !dep.includes('blocknote') &&
              !dep.includes('monaco') &&
              // !dep.includes('nivo') &&
              !dep.includes('settings') &&
              !dep.includes('shiki') &&
              !dep.includes('monaco-core') &&
              !dep.includes('typescript-lib') &&
              !dep.includes('xlsx-ugnis') &&
              !dep.includes('not-loaded')
            );
        },
      },
    },

    envPrefix: 'REACT_APP_',

    define: {
      _env_: {
        REACT_APP_SERVER_BASE_URL,
      },
      'process.env': {
        REACT_APP_SERVER_BASE_URL,
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    resolve: {
      alias: {
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        // https://github.com/twentyhq/twenty/pull/10782/files
        // This will likely be migrated to twenty-ui package when built separately
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
  };
});
