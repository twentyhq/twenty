import { test } from '@playwright/test';
import { sh } from '../../drivers/shell_driver';

test.describe('', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  /*

  test('Creating new workspace', async ({ page, browserName }) => {
    // this test must use only 1 browser, otherwise it will lead to success and fail (1 workspace is created instead of x workspaces)
    if (browserName == 'chromium') {
      await sh(
        'npx nx run twenty-server:database:reset --configuration=no-seed',
      );

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
      await sh('npx nx run twenty-server:database:reset');
   }
  });
  */

  test('Syncing all workspaces', async () => {
    await sh('npx nx run twenty-server:command workspace:sync-metadata -f');
  });
});
