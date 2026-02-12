import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: __dirname,
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    name: 'twenty-sdk-e2e',
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts'],
    globals: true,
    testTimeout: 60_000,
    hookTimeout: 60_000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    sequence: {
      concurrent: false,
    },
    setupFiles: ['src/cli/__tests__/constants/setupTest.ts'],
    globalSetup: undefined,
    onConsoleLog: () => true,
  },
});
