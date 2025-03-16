import { Locator, Page } from '@playwright/test';

export class SecuritySection {
  private readonly passwordToggle: Locator;
  private readonly inviteByLinkToggle: Locator;

  constructor(public readonly page: Page) {
    this.passwordToggle = page.getByRole('checkbox').nth(1);
    this.inviteByLinkToggle = page.getByRole('checkbox').nth(2);
  }

  async togglePassword() {
    await this.passwordToggle.click();
  }

  async toggleInviteByLink() {
    await this.inviteByLinkToggle.click();
  }
}
