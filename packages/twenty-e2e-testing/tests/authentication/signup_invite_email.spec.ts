import { randomUUID } from 'crypto';
import { expect, test } from './fixture';

test('Sign up with invite link via email', async ({
  page,
  loginPage,
  leftMenu,
  membersSection,
  settingsPage,
  profileSection,
  confirmationModal,
}) => {
  const email = `test${randomUUID().replaceAll('-', '')}@apple.dev`;
  const firstName = 'John';
  const lastName = 'Doe';

  const inviteLink: string =
    await test.step('Go to Settings and copy invite link', async () => {
      await page.goto(process.env.LINK); // skip login page (and redirect) when running on environments with multi-workspace enabled
      await leftMenu.goToSettings();
      await settingsPage.goToMembersSection();
      await membersSection.copyInviteLink();
      return await page.evaluate('navigator.clipboard.readText()');
    });

  await test.step('Go to invite link', async () => {
    await settingsPage.logout();

    // Logging out fires several redirects to /welcome over ~1s, and one landing
    // mid-navigation interrupts the goto, so retry until the invite page sticks.
    await expect(async () => {
      await page.goto(inviteLink);
      await expect(page.getByText(/Join .+ team/)).toBeVisible({
        timeout: 5000,
      });
    }).toPass({ timeout: 60000 });
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
