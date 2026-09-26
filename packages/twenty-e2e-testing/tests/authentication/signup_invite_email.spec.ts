import { randomUUID } from 'crypto';
import { AUTH_STORAGE_STATE_PATH } from '../../lib/constants/authStorageStatePath';
import { LeftMenu } from '../../lib/pom/leftMenu';
import { MembersSection } from '../../lib/pom/settings/membersSection';
import { SettingsPage } from '../../lib/pom/settingsPage';
import { expect, test } from './fixture';

test.use({ storageState: { cookies: [], origins: [] } });

test('Sign up with invite link via email', async ({
  browser,
  page,
  loginPage,
  leftMenu,
  settingsPage,
  profileSection,
  confirmationModal,
}) => {
  const email = `test${randomUUID().replaceAll('-', '')}@apple.dev`;
  const firstName = 'John';
  const lastName = 'Doe';

  const inviteLink: string =
    await test.step('Go to Settings and copy invite link', async () => {
      // Later tests reuse the saved session, and signing out or signing up
      // from it would revoke it server-side.
      const inviterPage = await browser.newPage({
        storageState: AUTH_STORAGE_STATE_PATH,
        permissions: ['clipboard-read', 'clipboard-write'],
      });

      try {
        await inviterPage.goto(process.env.LINK);
        await new LeftMenu(inviterPage).goToSettings();
        await new SettingsPage(inviterPage).goToMembersSection();
        await new MembersSection(inviterPage).copyInviteLink();

        return await inviterPage.evaluate(() => navigator.clipboard.readText());
      } finally {
        await inviterPage.close();
      }
    });

  await test.step('Go to invite link', async () => {
    await page.goto(inviteLink);
    await expect(page.getByText(/Join .+ team/)).toBeVisible();
  });

  await test.step('Create new account', async () => {
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail(email);
    await loginPage.clickContinueButton();
    await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
    await loginPage.clickSignUpButton();
    await expect(page.getByText('Create profile')).toBeVisible();
    await expect(page.getByPlaceholder('Head of Partnerships')).toBeVisible();
    await loginPage.typeFirstName(firstName);
    await loginPage.typeLastName(lastName);
    await loginPage.clickContinueButton();
    await expect(page.getByTestId('workspace-dropdown')).toBeVisible();
  });

  await test.step('Log out and sign back in', async () => {
    await leftMenu.goToSettings();
    await settingsPage.logout();
    await page.waitForURL('**/welcome');

    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail(email);
    await loginPage.clickContinueButton();
    await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
    await loginPage.clickSignInButton();
  });

  await test.step('Delete account from workspace', async () => {
    await expect(page.getByTestId('workspace-dropdown')).toBeVisible();
    await leftMenu.goToSettings();
    await settingsPage.goToProfileSection();
    await profileSection.deleteAccount();
    await expect(page.getByText('Account Deletion')).toBeVisible();
    await confirmationModal.typePlaceholderToInput();
    await confirmationModal.clickConfirmButton();

    await page.waitForURL('**/welcome');
  });
});
