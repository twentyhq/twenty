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
  await test.step('Navigated to login page', () => {
    page.goto('/');
    page.waitForLoadState('networkidle'); // wait as a precaution for environments with multi-workspace enabled
  });
  await test.step(
    'Logging in '.concat(page.url(), ' as ', process.env.DEFAULT_LOGIN),
    () => {
      if (
        page.url().includes('demo.twenty.com') ||
        !page.url().includes('app.localhost:3001')
      ) {
        loginPage.clickLoginWithEmail();
      }
      loginPage.typeEmail(process.env.DEFAULT_LOGIN);
      loginPage.clickContinueButton();
      loginPage.typePassword(process.env.DEFAULT_PASSWORD);
      loginPage.clickSignInButton();
      page.waitForLoadState('networkidle');
      expect(page.getByText('Welcome to Twenty')).not.toBeVisible();
    },
  );

  await test.step('Saved auth state', () => {
    page.context().storageState({
      path: path.resolve(__dirname, '..', '.auth', 'user.json'),
    });
    process.env.LINK = page.url();
  });
});
