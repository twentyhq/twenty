import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Unit tests for the enrichment mapper (pure functions). Unlike the integration
// config, these run without a live Twenty server, so there is no globalSetup.
export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    include: ['src/**/*.spec.ts'],
  },
});
