import { expect, test } from '@playwright/test';
import path from 'path';

import { LoginPage } from '../../lib/pom/loginPage';

// Same job as tests/login.setup.ts, minus the "Choose a workspace" step: this
// instance signs straight into the seeded Apple workspace.
test('Sign in and save auth state for the demo specs', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await loginPage.clickLoginWithEmailIfVisible();
  await loginPage.typeEmail(process.env.DEFAULT_LOGIN as string);
  await loginPage.clickContinueButton();
  await loginPage.typePassword(process.env.DEFAULT_PASSWORD as string);
  await loginPage.clickSignInButton();

  await expect(page.getByRole('link', { name: 'Companies' })).toBeVisible({
    timeout: 60_000,
  });

  await page.context().storageState({
    path: path.resolve(__dirname, '..', '..', '.auth', 'user.json'),
  });
});
