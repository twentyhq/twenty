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
    name: 'twenty-sdk-integration',
    environment: 'node',
    include: ['src/**/__integration__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.git/**'],
    globals: true,
    diff: {
      truncateThreshold: 0,
    },
    fileParallelism: false,
  },
});
