import react from '@vitejs/plugin-react-swc';
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
  const { REACT_APP_SERVER_BASE_URL } = env;

  const isBuildCommand = command === 'build';

  const checkers: Checkers = {
    typescript: {
      tsconfigPath: 'tsconfig.app.json',
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
        projects: [
          'tsconfig.json',
          // Include internal library aliases in development mode, so hot reload is enabled for libraries.
          mode === 'development' ? '../twenty-ui/tsconfig.json' : undefined,
        ].filter(Boolean) as string[],
      }),
      svgr(),
      checker(checkers),
    ],

    build: {
      outDir: 'build',
    },

    envPrefix: 'REACT_APP_',

    define: {
      'process.env': {
        REACT_APP_SERVER_BASE_URL,
      },
    },
  };
});
