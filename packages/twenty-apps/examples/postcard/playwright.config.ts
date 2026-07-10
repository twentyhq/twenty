import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

// WebKit on Linux ignores Playwright's `timezoneId` context emulation for
// Intl.resolvedOptions(), so it falls back to the runner's OS zone — the legacy
// `CET` alias, which WebKit's ICU rejects. `formatInTimeZone` then throws and
// crashes the record page before the front component can render. Pinning TZ
// here forces a WebKit-supported IANA zone at the OS/ICU level (the layer
// WebKit actually reads); the browser process Playwright spawns inherits it.
process.env.TZ = 'Europe/Paris';

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
    // Browser-level timezone emulation. Honored by Chromium; WebKit/Linux
    // ignores it for Intl.resolvedOptions() (see the TZ pin above, which is the
    // actual fix there). Kept aligned with TZ for deterministic date rendering.
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
