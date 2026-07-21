import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'twenty-sdk-e2e',
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts'],
    globals: true,
    testTimeout: 60_000,
    hookTimeout: 60_000,
    pool: 'forks',
    // poolOptions.forks.singleFork was removed in Vitest 4; without serial
    // file execution the e2e forks race on the shared ~/.twenty config file.
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    env: {
      TWENTY_API_URL: process.env.TWENTY_API_URL ?? 'http://localhost:2020',
      TWENTY_API_KEY:
        process.env.TWENTY_API_KEY ??
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzM1Njg5NjAwLCJleHAiOjQ4OTE0NDk2MDAsImp0aSI6IjIwMjAyMDIwLWY0MDEtNGQ4YS1hNzMxLTY0ZDAwN2MyN2JhZCJ9.bfQjfyN0NEtTCLE_xPyNcwonDzlSXFoP8kdCQTdnuDc',
    },
    setupFiles: ['src/cli/__tests__/constants/setupTest.ts'],
    globalSetup: undefined,
    onConsoleLog: () => true,
  },
});
