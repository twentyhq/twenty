import { expect, test } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../../lib/pom/loginPage';

test('Authenticate demo user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.goto('/');
  await loginPage.clickLoginWithEmailIfVisible();
  await loginPage.typeEmail(process.env.DEFAULT_LOGIN as string);
  await loginPage.clickContinueButton();
  await loginPage.typePassword(process.env.DEFAULT_PASSWORD as string);
  await loginPage.clickSignInButton();

  const workspacePicker = page.getByText('Choose a workspace');

  if (await workspacePicker.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await page.getByText('Apple', { exact: true }).click();
  }

  await expect(page.getByRole('link', { name: 'Companies' })).toBeVisible();

  await page.context().storageState({
    path: path.resolve(__dirname, '.auth', 'demo-user.json'),
  });
});
