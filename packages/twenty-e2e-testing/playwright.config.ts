import { defineConfig, devices } from '@playwright/test';

import { config } from 'dotenv';
config();

/**
 * See https://playwright.dev/docs/test-configuration.
 * See https://playwright.dev/docs/trace-viewer to Collect trace when retrying the failed test
 */
export default defineConfig({
  testDir: 'e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
