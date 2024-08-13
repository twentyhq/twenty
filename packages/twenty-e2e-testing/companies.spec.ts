import { test, expect } from '@playwright/test';

const date = new Date();

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue With Email' }).click();
  await page.getByPlaceholder('Email').fill('tim@apple.dev');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByPlaceholder('Password').fill('Applecar2025');
  await page.getByRole('button', { name: 'Sign in' }).click();
});

test.afterEach(async ({ page, browserName }) => {
  await page.screenshot({
    path: `./packages/twenty-e2e-testing/__screenshots__/${browserName}/${date.toISOString()}.png`,
  });
});

test('Checking if table in Companies is visible', async ({ page }) => {
  await page.getByRole('link', { name: 'Companies' }).click();
  expect(page.url()).toContain('/companies');
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('tr')).toHaveCount(14);
});