import { randomUUID } from 'crypto';
import { expect, test } from './fixture';

// Signing up on the workspace subdomain the shared fixture points at is
// refused, so create the workspace from the base domain instead.
test.use({
  storageState: { cookies: [], origins: [] },
  baseURL: process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001',
});

test('New workspace signup goes through every onboarding stage', async ({
  page,
  loginPage,
}) => {
  test.setTimeout(180000);

  const suffix = randomUUID().replaceAll('-', '').slice(0, 12);
  const email = `test${suffix}@apple.dev`;
  const workspaceName = `Test ${suffix}`;
  const subdomain = `test-${suffix}`;

  await test.step('Create a new account', async () => {
    await page.goto('/welcome');
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail(email);
    await loginPage.clickContinueButton();
    await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
    await loginPage.clickSignUpButton();
  });

  await test.step('Create the workspace', async () => {
    await expect(page.getByText('Create your workspace')).toBeVisible();
    await loginPage.typeWorkspaceName(workspaceName);
    await loginPage.typeSubdomain(subdomain);
    await loginPage.clickCreateWorkspaceButton();
  });

  await test.step('Workspace activation stage', async () => {
    await page.waitForURL('**/workspace-activation', { timeout: 90000 });
  });

  const syncEmailsHeading = page.getByText('Import your contacts');
  const installAppsHeading = page.getByText('Install your first apps');
  const createProfileHeading = page.getByText('Create profile');

  // Both stages auto-skip when the instance has no connected-account provider
  // and no vetted marketplace app, which is how the e2e server is configured.
  await test.step('Sync-email stage (when shown)', async () => {
    await expect(
      syncEmailsHeading.or(installAppsHeading).or(createProfileHeading),
    ).toBeVisible({
      timeout: 90000,
    });

    if (!(await syncEmailsHeading.isVisible())) {
      return;
    }

    await loginPage.clickSkipOnboardingStep();
    await expect(installAppsHeading).toBeVisible();

    await test.step('Goes back to the skipped sync-email stage', async () => {
      await page.getByRole('button', { name: 'Go back' }).click();
      await expect(syncEmailsHeading).toBeVisible();

      await page.reload();
      await expect(syncEmailsHeading).toBeVisible({
        timeout: 30000,
      });

      await loginPage.clickSkipOnboardingStep();
      await expect(installAppsHeading).toBeVisible();
    });
  });

  await test.step('Install-apps stage (when shown)', async () => {
    if (await installAppsHeading.isVisible()) {
      await loginPage.clickSkipOnboardingStep();
    }
  });

  await test.step('Create-profile stage', async () => {
    await expect(page.getByText('Create profile')).toBeVisible();
    await loginPage.typeFirstName('Ada');
    await loginPage.typeLastName('Lovelace');
    await loginPage.clickContinueButton();
  });

  await test.step('Invite-team stage', async () => {
    await expect(page.getByText('Invite your team')).toBeVisible();
    await loginPage.clickSkipOnboardingStep();
  });

  await test.step('Lands in the app', async () => {
    await expect(page.getByTestId('workspace-dropdown')).toBeVisible();
  });
});
