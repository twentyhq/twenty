import { defineConfig } from 'vitest/config';

import { createBundledSourcePlugin } from './vite.bundled-source-plugin';

export default defineConfig({
  plugins: [createBundledSourcePlugin()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'twenty-sdk-unit',
    environment: 'node',
    include: [
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/__e2e__/**',
      '**/__integration__/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/cli/cli.ts'],
      thresholds: {
        statements: 1,
        lines: 1,
        functions: 1,
      },
    },
    globals: true,
  },
});
