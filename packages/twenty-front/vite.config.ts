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

  const plugins = [
    react({ jsxImportSource: '@emotion/react' }),
    tsconfigPaths(),
    svgr(),
    checker(checkers),
  ];

  return {
    // base: ,
    envPrefix: 'REACT_APP_',
    build: {
      outDir: 'build',
    },
    plugins,
    server: {
      // open: true,
      port: 3001,
    },
    define: {
      'process.env': {
        REACT_APP_SERVER_BASE_URL,
      },
    },
  };
});
