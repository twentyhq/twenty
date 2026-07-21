import { randomUUID } from 'crypto';
import { expect, test } from './fixture';

test.use({ storageState: { cookies: [], origins: [] } });

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

  await test.step('Sync-email stage (skip when shown)', async () => {
    const syncEmailsHeading = page.getByText('Import your contacts');
    const installAppsHeading = page.getByText('Install your first apps');

    await expect(syncEmailsHeading.or(installAppsHeading)).toBeVisible({
      timeout: 90000,
    });

    if (await syncEmailsHeading.isVisible()) {
      await loginPage.clickSkipOnboardingStep();
    }
  });

  await test.step('Install-apps stage', async () => {
    await expect(page.getByText('Install your first apps')).toBeVisible();
    await loginPage.clickSkipOnboardingStep();
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
