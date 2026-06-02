import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Integration tests authenticate to a local Twenty server. Credentials are
// resolved from the shell env, then a gitignored .env.local in this directory
// (see .env.example). No API key is committed; if none is found, global-setup
// fails with a clear message.
const fileEnv = loadEnv('test', process.cwd(), 'TWENTY_');

const TWENTY_API_URL =
  process.env.TWENTY_API_URL ?? fileEnv.TWENTY_API_URL ?? 'http://localhost:2020';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY ?? fileEnv.TWENTY_API_KEY;

// Make env available to globalSetup (runs in the main process); test.env below
// covers the worker processes.
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
