import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

// Front-end base URL of the running Twenty instance under test.
const FRONT_BASE_URL = process.env.FRONT_BASE_URL ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60 * 1000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: FRONT_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
    testIdAttribute: 'data-testid',
    // Emulates the browser timezone (not the member record). The member's
    // timeZone defaults to 'system', which resolves via the browser's
    // Intl.resolvedOptions() to the CI runner's OS zone (CET). WebKit's ICU
    // rejects the legacy `CET` alias and throws while formatting dates, crashing
    // the record page before the front component can render. Pinning a
    // WebKit-supported IANA zone here makes 'system' resolve deterministically
    // regardless of the runner's OS timezone.
    timezoneId: 'Europe/Paris',
  },
  expect: {
    timeout: 15_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, 'e2e/.auth/user.json'),
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: path.resolve(__dirname, 'e2e/.auth/user.json'),
      },
      dependencies: ['setup'],
    },
  ],
});
