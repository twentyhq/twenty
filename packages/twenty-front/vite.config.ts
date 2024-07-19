import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

type Checkers = Parameters<typeof checker>[0];

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  /*
    Using explicit env variables, there is no need to expose all of them (security).
  */
  const { REACT_APP_SERVER_BASE_URL, VITE_BUILD_SOURCEMAP } = env;

  const isBuildCommand = command === 'build';

  const checkers: Checkers = {
    typescript: {
      tsconfigPath: path.resolve(__dirname, './tsconfig.app.json'),
    },
    overlay: false,
  };

  if (!isBuildCommand) {
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
  };
});
