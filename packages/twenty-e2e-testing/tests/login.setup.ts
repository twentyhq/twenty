import { expect, test as setup } from '@playwright/test';
import path from 'path';

setup('Login test', async ({ page }) => {
  console.log('Starting login test');

  await page.goto('/');
  console.log('Navigated to homepage');

  await page.getByRole('button', { name: 'Continue With Email' }).click();
  console.log('Clicked email login button');

  console.log('Default login', process.env.DEFAULT_LOGIN);
  await page.getByPlaceholder('Email').fill(process.env.DEFAULT_LOGIN ?? '');
  console.log('Filled email field');

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  console.log('Clicked continue button');

  await page
    .getByPlaceholder('Password')
    .fill(process.env.DEFAULT_PASSWORD ?? '');
  console.log('Filled password field');

  await page.getByRole('button', { name: 'Sign in' }).click();
  console.log('Clicked sign in button');

  await page.waitForLoadState('networkidle');
  console.log('Waited for network to be idle');

  await expect(page.getByText('Welcome to Twenty')).not.toBeVisible();
  console.log('Verified welcome message not visible');

  await page.context().storageState({
    path: path.resolve(__dirname, '..', '.auth', 'user.json'),
  });
  console.log('Saved auth state');
});
