import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    include: ['src/**/*.integration-test.ts'],
    env: {
      // The SDK's ConfigService reads credentials from ~/.twenty/config.json
      // but falls back to a temp dir when NODE_ENV=test.
      NODE_ENV: 'integration',
      // MetadataApiClient defaults to TWENTY_API_URL for its GraphQL endpoint.
      TWENTY_API_URL: 'http://localhost:3000',
    },
  },
});
