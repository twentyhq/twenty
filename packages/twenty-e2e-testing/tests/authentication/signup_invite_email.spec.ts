import { randomUUID } from 'crypto';
import path from 'path';
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
      // Signing out the saved session would invalidate it for every later test.
      const inviterPage = await browser.newPage({
        storageState: path.resolve(__dirname, '..', '..', '.auth', 'user.json'),
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
