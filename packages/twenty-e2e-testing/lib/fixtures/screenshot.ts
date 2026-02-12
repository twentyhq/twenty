import { test as base } from '@playwright/test';
import path from 'path';

const date = new Date();

export const test = base.extend<{ screenshotHook: void }>({
  screenshotHook: [
    async ({ page, browserName }, use, workerInfo) => {
      // here everything is the same as beforeEach()
      // goto is to go to website as login setup saves the cookies of logged-in user, not the state of browser
      await page.goto('/');
      await use(); // here is the code of test
      // here everything is the same as afterEach()
      // automatic fixture of making screenshot after each test
      await page.screenshot({
        path: path.resolve(
          __dirname,
          '..',
          '..',
          'results',
          'screenshots',
          `${workerInfo.project.name}`,
          browserName,
          `${date.toISOString()}.png`,
        ),
      });
    },
    { auto: true },
  ],
  baseURL: process.env.LINK ? new URL(process.env.LINK).origin : 'http://localhost:3001',
});

export { expect } from '@playwright/test';
