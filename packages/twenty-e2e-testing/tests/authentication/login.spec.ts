import { test as base, expect } from '../../lib/fixtures/screenshot';
import { LoginPage } from '../../lib/pom/loginPage';

// fixture
const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

test('Check login with email', async ({ loginPage }) => {
  await loginPage.typeEmail(process.env.DEFAULT_LOGIN);
  await loginPage.clickContinueButton();
  await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
  await loginPage.clickSignInButton();
  await expect(loginPage.signInButton).not.toBeVisible();
});
