import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'twenty-client-sdk',
    environment: 'node',
    include: [
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/.git/**'],
    globals: true,
  },
});
