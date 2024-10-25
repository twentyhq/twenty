import { Locator, Page } from '@playwright/test';

export class AccountsSection {
  private readonly addAccountButton: Locator;
  private readonly deleteAccountButton: Locator;
  private readonly addBlocklistField: Locator;
  private readonly addBlocklistButton: Locator;
  private removeFromBlocklistButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.addAccountButton = page.getByRole('button', { name: 'Add account' });
    this.deleteAccountButton = page.getByText('Remove account');
    this.addBlocklistField = page.getByPlaceholder(
      'eddy@gmail.com, @apple.com',
    );
    this.addBlocklistButton = page.getByRole('button', {
      name: 'Add to blocklist',
    });
  }

  async clickAddAccount() {
    await this.addAccountButton.click();
  }

  async deleteAccount(email: string) {
    // needs fixing
    await this.page.locator('div').filter({ hasText: email }).hover();
    await this.deleteAccountButton.click();
  }

  async addToBlockList(domain: string) {
    await this.addBlocklistField.click();
    await this.addBlocklistField.fill(domain);
    await this.addBlocklistButton.click();
  }

  async removeFromBlocklist(domain: string) {
    this.removeFromBlocklistButton = this.page
      .locator('div')
      .filter({ hasText: domain })
      .getByRole('button'); // needs fixing
    await this.removeFromBlocklistButton.click();
  }
}
