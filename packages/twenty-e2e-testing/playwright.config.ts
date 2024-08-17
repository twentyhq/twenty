import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

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
  workers: process.env.CI ? 1 : undefined,
  timeout: 30 * 1000,
  use: {
    baseURL: process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true,
    testIdAttribute: 'data-testid',
    viewport: { width: 1920, height: 1080 }, // most laptops use this resolution
    launchOptions: {
      slowMo: 50,
    },
  },
  expect: {
    timeout: 5000,
  },
  reporter: [['html', { open: 'never' }]],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
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
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx nx start',
    url: 'http://localhost:3000', // somehow `localhost` is not mapped to 127.0.0.1
    reuseExistingServer: !process.env.CI,
  },
});
