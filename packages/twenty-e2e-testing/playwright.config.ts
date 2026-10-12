import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';
import { AUTH_STORAGE_STATE_PATH } from './lib/constants/authStorageStatePath';

const envResult = config({
  path: path.resolve(__dirname, '.env'),
});

if (envResult.error) {
  throw new Error('Failed to load .env file');
}

export default defineConfig({
  testDir: './tests',
  outputDir: 'run_results/',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // tests can't be parallelized
  timeout: process.env.CI ? 60_000 : 30 * 1000,
  use: {
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'on',
    headless: true, // instead of changing it to false, run 'yarn test:e2e:debug' or 'yarn test:e2e:ui'
    testIdAttribute: 'data-testid',
  },
  expect: {
    // CI runners routinely exceed 5s on post-mutation UI transitions.
    timeout: process.env.CI ? 15_000 : 5000,
  },
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['./reporters/log-summary-reporter.ts'],
  ],
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['clipboard-read', 'clipboard-write'],
        storageState: AUTH_STORAGE_STATE_PATH,
      },
      dependencies: ['setup'],
    },
  ],
});
