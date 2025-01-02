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
  console.log('Starting login test');

  await page.goto('/');
  console.log('Navigated to homepage');

  console.log('Default login', process.env.DEFAULT_LOGIN);
  await loginPage.typeEmail(process.env.DEFAULT_LOGIN);
  console.log('Filled email field');

  await loginPage.clickContinueButton();
  console.log('Clicked continue button');

  await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
  console.log('Filled password field');

  await loginPage.clickSignInButton();
  console.log('Clicked sign in button');

  await page.waitForLoadState('networkidle');
  console.log('Waited for network to be idle');

  await expect(page.getByText('Welcome to Twenty')).not.toBeVisible();
  console.log('Verified welcome message not visible');

  await page.context().storageState({
    path: path.resolve(__dirname, '..', '.auth', 'user.json'),
  });
  console.log('Saved auth state');

  process.env.LINK = page.url();
});
