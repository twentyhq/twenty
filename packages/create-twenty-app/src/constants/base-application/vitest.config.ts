import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    include: ['src/**/*.integration-test.ts'],
    env: {
      NODE_ENV: 'integration',
      TWENTY_API_URL: 'http://localhost:3000',
    },
  },
});
