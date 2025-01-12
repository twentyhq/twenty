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
    await test.step('Go to Settings and copy invite link', () => {
      page.goto(process.env.LINK); // skip login page (and redirect) when running on environments with multi-workspace enabled
      leftMenu.goToSettings();
      settingsPage.goToMembersSection();
      membersSection.copyInviteLink();
    });
    const inviteLink: string = await page.evaluate(
      'navigator.clipboard.readText()',
    );
    await test.step('Go to invite link', () => {
      settingsPage.logout();
      page.goto(inviteLink);
    });
    await test.step('Create new account', () => {
      loginPage.clickLoginWithEmail();
      loginPage.typeEmail(email);
      loginPage.clickContinueButton();
      loginPage.typePassword(process.env.DEFAULT_PASSWORD);
      loginPage.clickSignUpButton();
      loginPage.typeFirstName(firstName);
      loginPage.typeLastName(lastName);
      loginPage.clickContinueButton();
      loginPage.noSyncWithGoogle();
      testCompleted = true;
    });
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
        await test.step('Cleanup - deleting account', () => {
          leftMenu.goToSettings();
          settingsPage.goToProfileSection();
          profileSection.deleteAccount();
          confirmationModal.typePlaceholderToInput();
          confirmationModal.clickConfirmButton();
          expect(page.url()).toContain('/welcome');
        });
      }
    },
  );
});
