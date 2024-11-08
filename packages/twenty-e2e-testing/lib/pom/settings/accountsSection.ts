import { Locator, Page } from '@playwright/test';

export class AccountsSection {
  private readonly addAccountButton: Locator;
  private readonly deleteAccountButton: Locator;
  private readonly addBlocklistField: Locator;
  private readonly addBlocklistButton: Locator;
  private readonly connectWithGoogleButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.addAccountButton = page.getByRole('button', { name: 'Add account' });
    this.deleteAccountButton = page
      .getByTestId('tooltip')
      .getByText('Remove account');
    this.addBlocklistField = page.getByPlaceholder(
      'eddy@gmail.com, @apple.com',
    );
    this.addBlocklistButton = page.getByRole('button', {
      name: 'Add to blocklist',
    });
    this.connectWithGoogleButton = page.getByRole('button', {
      name: 'Connect with Google',
    });
  }

  async clickAddAccount() {
    await this.addAccountButton.click();
  }

  async deleteAccount(email: string) {
    await this.page
      .locator(`//span[contains(., "${email}")]/../div/div/div/button`)
      .click();
    await this.deleteAccountButton.click();
  }

  async addToBlockList(domain: string) {
    await this.addBlocklistField.fill(domain);
    await this.addBlocklistButton.click();
  }

  async removeFromBlocklist(domain: string) {
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${domain}')]/../../div[last()]/button`,
      )
      .click();
  }

  async linkGoogleAccount() {
    await this.connectWithGoogleButton.click();
  }
}
