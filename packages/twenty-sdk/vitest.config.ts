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
    name: 'twenty-sdk',
    environment: 'node',
    include: [
      'src/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'src/**/__integration__/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/__e2e__/**',
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
