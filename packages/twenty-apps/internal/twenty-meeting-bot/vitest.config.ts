import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const fileEnv = loadEnv('test', process.cwd(), 'TWENTY_');

const TWENTY_API_URL =
  process.env.TWENTY_API_URL ?? fileEnv.TWENTY_API_URL ?? 'http://localhost:2020';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY ?? fileEnv.TWENTY_API_KEY;

// Make env vars available to globalSetup (test.env only applies to workers)
process.env.TWENTY_API_URL = TWENTY_API_URL;
if (TWENTY_API_KEY) {
  process.env.TWENTY_API_KEY = TWENTY_API_KEY;
}

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    include: ['src/**/*.integration-test.ts'],
    globalSetup: ['src/__tests__/global-setup.ts'],
    env: {
      TWENTY_API_URL,
      ...(TWENTY_API_KEY ? { TWENTY_API_KEY } : {}),
    },
  },
});
