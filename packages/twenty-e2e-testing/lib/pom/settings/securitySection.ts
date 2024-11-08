import { Locator, Page } from '@playwright/test';

export class SecuritySection {
  private readonly inviteByLinkToggle: Locator;

  constructor(public readonly page: Page) {
    this.inviteByLinkToggle = page.locator('input[type="checkbox"]').nth(1);
  }

  async toggleInviteByLink() {
    await this.inviteByLinkToggle.click();
  }
}
