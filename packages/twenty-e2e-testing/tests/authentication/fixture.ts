import { test as base } from '../../lib/fixtures/screenshot';
import { ConfirmationModal } from '../../lib/pom/helper/confirmationModal';
import { LeftMenu } from '../../lib/pom/leftMenu';
import { LoginPage } from '../../lib/pom/loginPage';
import { MembersSection } from '../../lib/pom/settings/membersSection';
import { ProfileSection } from '../../lib/pom/settings/profileSection';
import { SettingsPage } from '../../lib/pom/settingsPage';

type Fixtures = {
  confirmationModal: ConfirmationModal;
  loginPage: LoginPage;
  leftMenu: LeftMenu;
  settingsPage: SettingsPage;
  membersSection: MembersSection;
  profileSection: ProfileSection;
};

export const test = base.extend<Fixtures>({
  confirmationModal: async ({ page }, use) => {
    const confirmationModal = new ConfirmationModal(page);
    await use(confirmationModal);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  leftMenu: async ({ page }, use) => {
    const leftMenu = new LeftMenu(page);
    await use(leftMenu);
  },
  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },
  membersSection: async ({ page }, use) => {
    const membersSection = new MembersSection(page);
    await use(membersSection);
  },
  profileSection: async ({ page }, use) => {
    const profileSection = new ProfileSection(page);
    await use(profileSection);
  },
});

export { expect } from '@playwright/test';
