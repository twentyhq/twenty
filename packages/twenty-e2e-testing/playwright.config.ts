import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

const envResult = config({
  path: path.resolve(__dirname, '.env'),
});

if (envResult.error) {
  throw new Error('Failed to load .env file');
}

/* === Run your local dev server before starting the tests === */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: 'run_results/', // directory for screenshots and videos
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}', // just in case, do not delete it
  fullyParallel: false, // parallelization of tests will be done later in the future
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 1 worker = 1 test at the time, tests can't be parallelized
  timeout: 30 * 1000, // timeout can be changed
  use: {
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3001',
    trace: 'retain-on-failure', // trace takes EVERYTHING from page source, records every single step, should be used only when normal debugging won't work
    screenshot: 'on', // either 'on' here or in different method in modules, if 'on' all screenshots are overwritten each time the test is run
    headless: true, // instead of changing it to false, run 'yarn test:e2e:debug' or 'yarn test:e2e:ui'
    testIdAttribute: 'data-testid', // taken from Twenty source
  },
  expect: {
    timeout: 5000,
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
        storageState: path.resolve(__dirname, '.auth', 'user.json'), // takes saved cookies from directory
      },
      dependencies: ['setup'],
    },

    //{
    //  name: 'webkit',
    //  use: { ...devices['Desktop Safari'] },
    //},

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    //{
    //  name: 'Microsoft Edge',
    //  use: { ...devices['Desktop Edge'], channel: 'msedge' },
    //},
    //{
    //  name: 'Google Chrome',
    //  use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    //},
  ],
});
