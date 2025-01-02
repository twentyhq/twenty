import { expect, test } from './fixture';

test.describe('Authentication test', () => {
  const email = 'test@apple.dev';
  const firstName = 'John';
  const lastName = 'Doe';
  let testCompleted = false;

  test('Sign up with invite link via email', async ({
    page,
    loginPage,
    leftMenu,
    membersSection,
    settingsPage,
  }) => {
    await page.goto(process.env.LINK); // skip login page (and redirect) when running on local environment
    await leftMenu.goToSettings();
    await settingsPage.goToMembersSection();
    await membersSection.copyInviteLink();
    const inviteLink: string = await page.evaluate(
      'navigator.clipboard.readText()',
    );
    await settingsPage.logout();
    await page.goto(inviteLink);
    await loginPage.clickLoginWithEmail();
    await loginPage.typeEmail(email);
    await loginPage.clickContinueButton();
    await loginPage.typePassword(process.env.DEFAULT_PASSWORD);
    await loginPage.clickSignInButton();
    await loginPage.typeFirstName(firstName);
    await loginPage.typeLastName(lastName);
    await loginPage.clickContinueButton();
    await loginPage.noSyncWithGoogle();
    testCompleted = true;
  });

  test.afterEach(
    async ({
      page,
      confirmationModal,
      leftMenu,
      profileSection,
      settingsPage,
    }) => {
      if (testCompleted) {
        // security measurement to clean up only after test is completed,
        // otherwise default account used for tests may be deleted and resetting database will be necessary
        await leftMenu.goToSettings();
        await settingsPage.goToProfileSection();
        await profileSection.deleteAccount();
        await confirmationModal.typePlaceholderToInput();
        await confirmationModal.clickConfirmButton();
        expect(page.url()).toContain('/welcome');
      }
    },
  );
});
