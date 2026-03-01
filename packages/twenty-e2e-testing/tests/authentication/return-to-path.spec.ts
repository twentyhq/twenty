import { expect, test as base } from '@playwright/test';
import { LoginPage } from '../../lib/pom/loginPage';

const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

const loginAndSelectWorkspace = async (loginPage: LoginPage, page: any) => {
  await page.waitForLoadState('networkidle');
  await loginPage.clickLoginWithEmailIfVisible();
  await loginPage.typeEmail(process.env.DEFAULT_LOGIN!);
  await loginPage.clickContinueButton();
  await loginPage.typePassword(process.env.DEFAULT_PASSWORD!);
  await page.waitForLoadState('networkidle');
  await loginPage.clickSignInButton();
  await page.waitForLoadState('networkidle');

  const workspaceButton = page.getByText('Apple', { exact: true });

  try {
    await workspaceButton.waitFor({ state: 'visible', timeout: 5000 });
    await workspaceButton.click();
  } catch {
    // Single workspace mode — no workspace selection
  }

  try {
    await page.waitForFunction(
      () => window.location.href.includes('verify'),
      { timeout: 5000 },
    );
  } catch {
    // Verify step may be skipped
  }

  await page.waitForFunction(
    () => !window.location.href.includes('verify'),
    { timeout: 15000 },
  );
};

test.describe('Return-to-path after login', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should redirect to deep link after login', async ({
    page,
    loginPage,
  }) => {
    const deepLink = '/settings/accounts';

    await test.step('Navigate to deep link while logged out', async () => {
      await page.goto(deepLink);
      await page.waitForURL('**/welcome');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Verify return-to-path was saved', async () => {
      const savedPath = await page.evaluate(() => {
        const raw = sessionStorage.getItem('twenty:returnToPath');

        if (!raw) return null;

        return JSON.parse(raw).path;
      });

      expect(savedPath).toBe(deepLink);
    });

    await test.step('Log in and select workspace', async () => {
      await loginAndSelectWorkspace(loginPage, page);
    });

    await test.step(
      'Verify redirected to original deep link',
      async () => {
        await page.waitForURL(`**${deepLink}`, { timeout: 15000 });
        expect(new URL(page.url()).pathname).toBe(deepLink);
      },
    );

    await test.step(
      'Verify return-to-path was cleared after use',
      async () => {
        const savedPath = await page.evaluate(() =>
          sessionStorage.getItem('twenty:returnToPath'),
        );

        expect(savedPath).toBeNull();
      },
    );
  });

  test('should preserve path with query params across login', async ({
    page,
    loginPage,
  }) => {
    const targetPath =
      '/authorize?clientId=test-client-id&redirectUrl=https%3A%2F%2Fexample.com%2Fcallback';

    await test.step(
      'Navigate to path with query params while logged out',
      async () => {
        await page.goto(targetPath);
        await page.waitForURL('**/welcome');
        await page.waitForLoadState('networkidle');
      },
    );

    await test.step(
      'Verify return-to-path includes query params',
      async () => {
        const savedPath = await page.evaluate(() => {
          const raw = sessionStorage.getItem('twenty:returnToPath');

          if (!raw) return null;

          return JSON.parse(raw).path;
        });

        expect(savedPath).toContain('/authorize');
        expect(savedPath).toContain('clientId=test-client-id');
        expect(savedPath).toContain('redirectUrl=');
      },
    );

    await test.step('Log in and select workspace', async () => {
      await loginAndSelectWorkspace(loginPage, page);
    });

    await test.step(
      'Verify redirected to original path with query params',
      async () => {
        await page.waitForURL('**/authorize**', { timeout: 15000 });
        const url = new URL(page.url());

        expect(url.pathname).toBe('/authorize');
        expect(url.searchParams.get('clientId')).toBe('test-client-id');
        expect(url.searchParams.get('redirectUrl')).toBe(
          'https://example.com/callback',
        );
      },
    );
  });
});
