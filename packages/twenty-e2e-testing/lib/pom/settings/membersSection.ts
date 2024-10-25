import { Locator, Page, expect } from '@playwright/test';

export class MembersSection {
  private readonly inviteMembersField: Locator;
  private readonly inviteMembersButton: Locator;
  private readonly inviteLinkButton: Locator;
  private deleteMemberButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.inviteMembersField = page.getByPlaceholder(
      'tim@apple.com, jony.ive@apple',
    );
    this.inviteMembersButton = page.getByRole('button', { name: 'Invite' });
    this.inviteLinkButton = page.getByRole('button', { name: 'Copy link' });
  }

  async sendInviteLink(email: string) {
    await this.inviteMembersField.click();
    await this.inviteMembersField.fill(email);
    await this.inviteLinkButton.click();
  }

  async deleteMember(email: string) {
    this.deleteMemberButton = this.page
      .locator('div')
      .filter({ hasText: email })
      .getByRole('button');
    await this.deleteMemberButton.click();
  }
}
