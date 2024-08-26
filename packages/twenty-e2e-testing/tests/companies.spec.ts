import { test, expect } from '@playwright/test';
import { config } from 'dotenv';
import path = require('path');
config({ path: path.resolve(__dirname, '..', '.env') });

const date = new Date();

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue With Email' }).click();
  await page.getByPlaceholder('Email').fill(process.env.DEFAULT_LOGIN);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Password').fill(process.env.DEFAULT_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
});

test.afterEach(async ({ page, browserName }, workerInfo) => {
  await page.screenshot({
    path: path.resolve(
      __dirname,
      '..',
      'results',
      'screenshots',
      browserName,
      `${workerInfo.project.name}`,
      `${date.toISOString()}.png`,
    ),
  });
});

test.describe('Basic check', () => {
  test('Checking if table in Companies is visible', async ({ page }) => {
    await expect(page.getByTestId('tooltip').nth(0)).toHaveText('Companies');
    await expect(page.getByTestId('tooltip').nth(0)).toBeVisible();
    expect(page.url()).toContain('/companies');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody > tr')).toHaveCount(13); // shouldn't be hardcoded in case of tests on demo
  });
});
