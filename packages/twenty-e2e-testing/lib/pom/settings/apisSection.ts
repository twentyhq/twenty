import { Locator, Page } from '@playwright/test';

export class APIsSection {
  private readonly createApiKeyButton: Locator;
  private readonly regenerateApiKeyButton: Locator;
  private readonly nameOfApiKeyInput: Locator;
  private readonly expirationDateApiKeySelect: Locator;
  private readonly cancelButton: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.createApiKeyButton = page.getByRole('link', {
      name: 'Create API Key',
    });
    this.nameOfApiKeyInput = page
      .getByPlaceholder('E.g. backoffice integration')
      .first();
    this.expirationDateApiKeySelect = page.locator(
      'div[aria-controls="object-field-type-select-options"]',
    );
    this.regenerateApiKeyButton = page.getByRole('button', {
      name: 'Regenerate Key',
    });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
  }

  async createApiKey() {
    await this.createApiKeyButton.click();
  }

  async typeApiKeyName(name: string) {
    await this.nameOfApiKeyInput.clear();
    await this.nameOfApiKeyInput.fill(name);
  }

  async selectApiExpirationDate(date: string) {
    await this.expirationDateApiKeySelect.click();
    await this.page.getByText(date, { exact: true }).click();
  }

  async regenerateApiKey() {
    await this.regenerateApiKeyButton.click();
  }

  async deleteApiKey() {
    await this.deleteButton.click();
  }

  async clickCancelButton() {
    await this.cancelButton.click();
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }

  async checkApiKeyDetails(name: string) {
    await this.page.locator(`//a/div[contains(.,'${name}')][first()]`).click();
  }
}
