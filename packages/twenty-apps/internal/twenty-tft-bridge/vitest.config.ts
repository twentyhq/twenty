import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['tsconfig.spec.json'], ignoreConfigErrors: true })],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/*.integration-test.ts'],
    globalSetup: './src/__tests__/global-setup.ts',
  },
});
