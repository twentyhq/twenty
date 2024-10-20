import { test as setup, expect } from '@playwright/test';
import path from 'path';

setup('Login test', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue With Email' }).click();
  await page.getByPlaceholder('Email').fill(process.env.DEFAULT_LOGIN);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Password').fill(process.env.DEFAULT_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Welcome to Twenty')).not.toBeVisible();

  // End of authentication steps.

  await page.context().storageState({
    path: path.resolve(__dirname, '..', '.auth', 'user.json'),
  });
});
