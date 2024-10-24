import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import path from 'path';

config();

/* === Run your local dev server before starting the tests === */

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: '.',
  outputDir: 'run_results/', // directory for screenshots and videos
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}', // just in case, do not delete it
  fullyParallel: true, // false only for specific tests, overwritten in specific projects or global setups of projects
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined, // undefined = amount of projects * amount of tests
  timeout: 30 * 1000, // timeout can be changed
  use: {
    baseURL: process.env.CI
      ? process.env.CI_DEFAULT_BASE_URL
      : (process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001'),
    trace: 'retain-on-failure', // trace takes EVERYTHING from page source, records every single step, should be used only when normal debugging won't work
    screenshot: 'on', // either 'on' here or in different method in modules, if 'on' all screenshots are overwritten each time the test is run
    headless: true, // instead of changing it to false, run 'yarn test:e2e:debug' or 'yarn test:e2e:ui'
    testIdAttribute: 'data-testid', // taken from Twenty source
    viewport: { width: 1920, height: 1080 }, // most laptops use this resolution
    launchOptions: {
      slowMo: 500, // time in milliseconds between each step, better to use it than explicitly define timeout in tests
    },
  },
  expect: {
    timeout: 5000,
  },
  reporter: [['html', { open: 'never' }]],
  projects: [
    {
      name: 'Login setup',
      testMatch: /login\.setup\.ts/, // finds all tests matching this regex, in this case only 1 test should be found
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, '.auth', 'user.json'), // takes saved cookies from directory
      },
      dependencies: ['Login setup'], // forces to run login setup before running tests from this project - CASE SENSITIVE
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: path.resolve(__dirname, '.auth', 'user.json'),
      },
      dependencies: ['Login setup'],
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
