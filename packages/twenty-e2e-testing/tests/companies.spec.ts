import { test, expect } from '@playwright/test';
import { config } from 'dotenv';
import path = require('path');
config({ path: path.resolve(__dirname, '..', '.env') });

const date = new Date();

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue With Email' }).click();
  await page.getByPlaceholder('Email').fill(process.env.DEFAULT_LOGIN);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByPlaceholder('Password').fill(process.env.DEFAULT_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
});

test.afterEach(async ({ page, browserName }, workerInfo) => {
  await page.screenshot({
    path:
      `./packages/twenty-e2e-testing/results/screenshots/${browserName}/` +
      workerInfo.project.name +
      `${date.toISOString()}.png`,
  });
});

test.describe('Basic check', () => {
  test('Checking if table in Companies is visible', async ({ page }) => {
    await page.getByRole('link', { name: 'Companies' }).click();
    expect(page.url()).toContain('/companies');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody > tr')).toHaveCount(13);
  });
});
