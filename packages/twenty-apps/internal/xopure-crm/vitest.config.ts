import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    include: ['src/**/*.integration-test.ts'],
    setupFiles: ['src/__tests__/setup-test.ts'],
    env: {
      TWENTY_API_URL: process.env.TWENTY_API_URL ?? 'http://localhost:2020',
      TWENTY_API_KEY:
        process.env.TWENTY_API_KEY ??
        'test-api-key-not-valid-for-authentication',
    },
  },
});
