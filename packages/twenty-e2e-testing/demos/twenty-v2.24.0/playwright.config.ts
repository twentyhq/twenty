import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Demo-only config: the shared playwright.config.ts is owned by the real test
// suite, so release demos get their own testDir, viewport and auth state.
export default defineConfig({
  testDir: __dirname,
  outputDir: path.resolve(__dirname, 'run_results'),
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  use: {
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3001',
    headless: true,
    testIdAttribute: 'data-testid',
    viewport: { width: 1440, height: 900 },
    video: { mode: 'on', size: { width: 1440, height: 900 } },
  },
  expect: { timeout: 20_000 },
  reporter: [['list']],
  projects: [
    {
      name: 'demo-setup',
      testMatch: /demo\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'demo',
      testIgnore: /demo\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: path.resolve(__dirname, '.auth', 'demo-user.json'),
      },
      dependencies: ['demo-setup'],
    },
  ],
});
