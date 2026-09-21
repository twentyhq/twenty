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
  timeout: 90 * 1000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: FRONT_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
    testIdAttribute: 'data-testid',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  expect: {
    timeout: 15_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Chromium only: the fake media device flags that make getUserMedia and
    // MediaRecorder deterministic in CI are Chromium-specific.
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(__dirname, 'e2e/.auth/user.json'),
        permissions: ['microphone', 'camera'],
        launchOptions: {
          // Lets sandboxed environments point at a preinstalled Chromium
          // instead of downloading the pinned revision.
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        },
      },
      dependencies: ['setup'],
    },
  ],
});
