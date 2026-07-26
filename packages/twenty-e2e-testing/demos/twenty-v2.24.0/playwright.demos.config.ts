import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

const packageRoot = path.resolve(__dirname, '..', '..');

config({ path: path.resolve(packageRoot, '.env') });

// The shared playwright.config.ts scopes testDir to ./tests, so demo specs
// living under demos/ are invisible to it. This config only widens discovery
// and turns on video; everything else mirrors the shared setup.
export default defineConfig({
  testDir: packageRoot,
  outputDir: path.resolve(__dirname, 'run_results'),
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  use: {
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3001',
    screenshot: 'on',
    video: 'on',
    headless: true,
    viewport: { width: 1440, height: 900 },
    testIdAttribute: 'data-testid',
    // This machine ships a preinstalled Chromium that predates the browser
    // build Playwright 1.60 downloads, and the download host is unreachable.
    launchOptions: { executablePath: '/opt/pw-browsers/chromium' },
  },
  expect: { timeout: 15_000 },
  reporter: [['list']],
  projects: [
    {
      name: 'setup',
      testMatch: /demos\/twenty-v2\.24\.0\/login\.demos\.setup\.ts/,
    },
    {
      name: 'demos',
      testMatch: /demos\/twenty-v2\.24\.0\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: path.resolve(packageRoot, '.auth', 'user.json'),
      },
      dependencies: ['setup'],
    },
  ],
});
