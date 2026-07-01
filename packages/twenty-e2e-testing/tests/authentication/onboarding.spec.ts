import { randomUUID } from 'crypto';
import { expect, test } from './fixture';

// Covers the onboarding steps a newly invited member goes through. Reuses the
// invite mechanism (like signup_invite_email) so it runs in the same
// multi-workspace environment, and asserts the onboarding create-profile step.
test('Invited member completes the onboarding profile step and enters the app', async ({
  page,
  loginPage,
  leftMenu,
  membersSection,
  settingsPage,
  profileSection,
  confirmationModal,
}) => {
  const email = `test${randomUUID().replaceAll('-', '')}@apple.dev`;

  const inviteLink: string = await test.step(
    'Copy invite link from members settings',
    async () => {
      await page.goto(process.env.LINK);
      await leftMenu.goToSettings();
      await settingsPage.goToMembersSection();
      await membersSection.copyInviteLink();
      return await page.evaluate('navigator.clipboard.readText()');
    },
  );

  await test.step('Open the invite link as a logged-out visitor', async () => {
    await settingsPage.logout();

    await Promise.all([
      expect(page.getByText(/Join .+ team/)).toBeVisible(),

      page.goto(inviteLink),
    ]);
  });

  await test.step('Create the account', async () => {
    await loginPage.clickLoginWithEmailIfVisible();
    await loginPage.typeEmail(email);
    await loginPage.clickContinueButton();
    await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
    await loginPage.clickSignUpButton();
  });

  await test.step('Lands on the create-profile onboarding step', async () => {
    await expect(page.getByText('Create profile')).toBeVisible();
    await expect(page.getByPlaceholder('Head of Partnerships')).toBeVisible();
  });

  await test.step('Completes the profile and enters the app', async () => {
    await loginPage.typeFirstName('Ada');
    await loginPage.typeLastName('Lovelace');
    await loginPage.clickContinueButton();

    await expect(page.getByTestId('workspace-dropdown')).toBeVisible();
  });

  await test.step('Cleans up the created account', async () => {
    await leftMenu.goToSettings();
    await settingsPage.goToProfileSection();
    await profileSection.deleteAccount();
    await expect(page.getByText('Account Deletion')).toBeVisible();
    await confirmationModal.typePlaceholderToInput();
    await confirmationModal.clickConfirmButton();

    await page.waitForURL('**/welcome');
  });
});
