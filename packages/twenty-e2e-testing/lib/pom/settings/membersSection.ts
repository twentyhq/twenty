import { Locator, Page } from '@playwright/test';

export class MembersSection {
  private readonly inviteTab: Locator;
  private readonly inviteMembersField: Locator;
  private readonly inviteMembersButton: Locator;
  private readonly inviteLinkButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.inviteTab = page.getByTestId('tab-invite');
    this.inviteMembersField = page.getByPlaceholder(
      'tim@apple.com, jony.ive@apple',
    );
    this.inviteMembersButton = page.getByRole('button', { name: 'Invite' });
    this.inviteLinkButton = page.getByRole('button', { name: 'Copy link' });
  }

  async goToInviteTab() {
    await this.inviteTab.click();
  }

  async copyInviteLink() {
    await this.goToInviteTab();
    await this.inviteLinkButton.click();
  }

  async sendInviteEmail(email: string) {
    await this.goToInviteTab();
    await this.inviteMembersField.click();
    await this.inviteMembersField.fill(email);
    await this.inviteMembersButton.click();
  }

  async deleteMember(email: string) {
    await this.page
      .locator(`//div[contains(., '${email}')]/../../div[last()]/div/button`)
      .click();
  }

  async deleteInviteEmail(email: string) {
    await this.page
      .locator(
        `//div[contains(., '${email}')]/../../div[last()]/div/button[first()]`,
      )
      .click();
  }

  async refreshInviteEmail(email: string) {
    await this.page
      .locator(
        `//div[contains(., '${email}')]/../../div[last()]/div/button[last()]`,
      )
      .click();
  }
}
