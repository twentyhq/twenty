/* eslint-disable no-console */
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import path from 'path';
import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

type Checkers = Parameters<typeof checker>[0];

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const {
    REACT_APP_SERVER_BASE_URL,
    VITE_BUILD_SOURCEMAP,
    VITE_DISABLE_TYPESCRIPT_CHECKER,
    VITE_DISABLE_ESLINT_CHECKER,
  } = env;

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
        'eslint . --report-unused-disable-directives --max-warnings 0 --config .eslintrc.cjs',
    };
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-front',

    server: {
      port: 3001,
      host: 'localhost',
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          '**/@blocknote/core/src/fonts/**',
        ],
      },
    },

    plugins: [
      react({ jsxImportSource: '@emotion/react' }),
      tsconfigPaths({
        projects: ['tsconfig.json', '../twenty-ui/tsconfig.json'],
      }),
      svgr(),
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
          '**/AvatarChip.tsx',
        ],
        babelOptions: {
          presets: ['@babel/preset-typescript', '@babel/preset-react'],
        },
      }),
    ],

    build: {
      outDir: 'build',
      sourcemap: VITE_BUILD_SOURCEMAP === 'true',
    },

    envPrefix: 'REACT_APP_',

    define: {
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
      },
    },
  };
});
