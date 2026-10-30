import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './scripts/front-component-stories/native-tests',
  testMatch: 'layout-*.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL: process.env.STORYBOOK_URL ?? 'http://localhost:6008',
    headless: true,
    viewport: { width: 1280, height: 960 },
  },
});
