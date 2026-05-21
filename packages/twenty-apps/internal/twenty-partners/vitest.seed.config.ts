import { loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// Seed/import scripts authenticate with two distinct credential sets:
//   TWENTY_PARTNERS_API_URL / TWENTY_PARTNERS_API_KEY  -> local workspace target
//   TFT_API_URL / TFT_API_KEY                          -> TFT source (import only)
// Resolved from the shell env, then a gitignored .env.local (see .env.example).
// No API key is committed.
const fileEnv = loadEnv('test', process.cwd(), '');

const TWENTY_PARTNERS_API_URL =
  process.env.TWENTY_PARTNERS_API_URL ??
  fileEnv.TWENTY_PARTNERS_API_URL ??
  'http://localhost:2020';
const TWENTY_PARTNERS_API_KEY =
  process.env.TWENTY_PARTNERS_API_KEY ?? fileEnv.TWENTY_PARTNERS_API_KEY;
const TFT_API_URL = process.env.TFT_API_URL ?? fileEnv.TFT_API_URL;
const TFT_API_KEY = process.env.TFT_API_KEY ?? fileEnv.TFT_API_KEY;

process.env.TWENTY_PARTNERS_API_URL = TWENTY_PARTNERS_API_URL;
if (TWENTY_PARTNERS_API_KEY) {
  process.env.TWENTY_PARTNERS_API_KEY = TWENTY_PARTNERS_API_KEY;
}
if (TFT_API_URL) process.env.TFT_API_URL = TFT_API_URL;
if (TFT_API_KEY) process.env.TFT_API_KEY = TFT_API_KEY;

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    testTimeout: 30_000,
    fileParallelism: false,
    include: ['src/scripts/**/*.ts'],
    env: {
      TWENTY_PARTNERS_API_URL,
      ...(TWENTY_PARTNERS_API_KEY ? { TWENTY_PARTNERS_API_KEY } : {}),
      ...(TFT_API_URL ? { TFT_API_URL } : {}),
      ...(TFT_API_KEY ? { TFT_API_KEY } : {}),
    },
  },
});
