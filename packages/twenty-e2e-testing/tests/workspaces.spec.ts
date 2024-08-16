import { test, expect } from '@playwright/test';
import { sh } from '../drivers/shell_driver';

const date = new Date();

test.afterEach(async ({ page, browserName }) => {
  await page.screenshot({
    path: `./packages/twenty-e2e-testing/results/screenshots/${browserName}/${date.toISOString()}.png`,
  });
});

test.describe('', () => {
  test('Testing logging', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Continue With Email' }).click();
    await page.getByPlaceholder('Email').fill('tim@apple.dev');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByPlaceholder('Password').fill('Applecar2025');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await expect(page.locator('tbody > tr')).toHaveCount(4);
    expect(page.url()).not.toContain('/welcome');
  });

  test('Creating new workspace', async ({ page, browserName }) => {
    // this test must use only 1 browser, otherwise it will lead to success and fail (1 workspace is created instead of x workspaces)
    if (browserName == 'firefox') {
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue With Email' }).click();
      await page.getByPlaceholder('Email').fill('test@apple.dev'); // email must be changed each time test is run
      await page.getByPlaceholder('Email').press('Enter'); // otherwise if tests fails after this step, new workspace is created
      await page.getByPlaceholder('Password').fill('Applecar2025');
      await page.getByPlaceholder('Password').press('Enter');
      await page.getByPlaceholder('Apple').fill('Test');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByPlaceholder('Tim').click();
      await page.getByPlaceholder('Tim').fill('Test2');
      await page.getByPlaceholder('Cook').click();
      await page.getByPlaceholder('Cook').fill('Test2');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByText('Continue without sync').click();
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.locator('table')).toBeVisible({ timeout: 1000 });
    }
  });

  test('Syncing all workspaces', async () => {
    await sh('npx nx run twenty-server:command workspace:sync-metadata -f');
    await sh('npx nx run twenty-server:command workspace:sync-metadata -f');
  });

  test('Resetting database', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      await sh('yarn nx database:reset twenty-server'); // if this command fails for any reason, database must be restarted manually using the same command because database is in unstable state
      await page.goto('/');
      await page.getByRole('button', { name: 'Continue With Email' }).click();
      await page.getByPlaceholder('Email').fill('tim@apple.dev');
      await page.getByRole('button', { name: 'Continue' }).click();
      await page.getByPlaceholder('Password').fill('Applecar2025');
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('link', { name: 'Companies' }).click();
      expect(page.url()).toContain('/companies');
      await expect(page.locator('table')).toBeVisible();
    }
  });

  test('Seeding database', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      await sh('npx nx workspace:seed:demo');
      await page.goto('/');
    }
  });
});
