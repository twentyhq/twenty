import { expect, test as base } from '@playwright/test';
import { LoginPage } from '../lib/pom/loginPage';
import path from 'path';

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
      if (
        page.url().includes('demo.twenty.com') ||
        !page.url().includes('app.localhost:3001')
      ) {
        await loginPage.clickLoginWithEmail();
      }
      await loginPage.typeEmail(process.env.DEFAULT_LOGIN);
      await loginPage.clickContinueButton();
      await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
      await page.waitForLoadState('networkidle');
      await loginPage.clickSignInButton();
      await expect(page.getByText('Welcome to Twenty')).not.toBeVisible();
    },
  );

  await test.step('Saved auth state', async () => {
    await page.context().storageState({
      path: path.resolve(__dirname, '..', '.auth', 'user.json'),
    });
    process.env.LINK = page.url();
  });
});
