import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'twenty-sdk-integration',
    environment: 'node',
    include: ['src/**/__integration__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.git/**'],
    globals: true,
    diff: {
      truncateThreshold: 0,
    },
    fileParallelism: false,
    setupFiles: ['src/cli/__tests__/integration/utils/setup-app-dev-mocks.ts'],
  },
});
