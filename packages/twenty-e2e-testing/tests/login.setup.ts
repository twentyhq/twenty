import { test as base, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../lib/pom/loginPage';

// fixture
const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

test('Login test', async ({ loginPage, page }) => {
  await test.step('Navigated to login page', async () => {
    await page.goto('/');
  });
  await test.step(
    'Logging in '.concat(page.url(), ' as ', process.env.DEFAULT_LOGIN),
    async () => {
      await page.waitForLoadState('networkidle');
      // Click "Continue with Email" if visible (may be skipped if password is the only auth method)
      await loginPage.clickLoginWithEmailIfVisible();
      await loginPage.typeEmail(process.env.DEFAULT_LOGIN);
      await loginPage.clickContinueButton();
      await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
      await page.waitForLoadState('networkidle');
      await loginPage.clickSignInButton();
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(/Welcome, .+/)).not.toBeVisible();
      await expect(page.getByText('Choose a workspace')).toBeVisible();
      await page.getByText('Apple', {exact: true}).click();
      await page.waitForFunction(() => window.location.href.includes('verify'));
      await page.waitForFunction(() => !window.location.href.includes('verify'));
      process.env.LINK = page.url();
    },
  );

  await test.step('Saved auth state', async () => {
    await page.context().storageState({
      path: path.resolve(__dirname, '..', '.auth', 'user.json'),
    });
  });
});
