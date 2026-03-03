import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    include: ['src/**/*.integration-test.ts'],
    env: {
      TWENTY_API_URL: 'http://localhost:3000',
      TWENTY_CONFIG_PATH: '.twenty-test/config.json',
    },
  },
});
