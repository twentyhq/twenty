import { Locator, Page } from '@playwright/test';

export class DevelopersSection {
  private readonly readDocumentationButton: Locator;
  private readonly createAPIKeyButton: Locator;
  private readonly regenerateAPIKeyButton: Locator;
  private readonly nameOfAPIKeyInput: Locator;
  private readonly expirationDateAPIKeySelect: Locator;
  private readonly createWebhookButton: Locator;
  private readonly webhookURLInput: Locator;
  private readonly webhookDescription: Locator;
  private readonly webhookFilterObjectSelect: Locator;
  private readonly webhookFilterActionSelect: Locator;
  private readonly cancelButton: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.readDocumentationButton = page.getByRole('link', {
      name: 'Read documentation',
    });
    this.createAPIKeyButton = page.getByRole('link', {
      name: 'Create API Key',
    });
    this.createWebhookButton = page.getByRole('link', {
      name: 'Create Webhook',
    });
    this.nameOfAPIKeyInput = page
      .getByPlaceholder('E.g. backoffice integration')
      .first();
    this.expirationDateAPIKeySelect = page
      .locator('div')
      .filter({ hasText: /^Never$/ })
      .nth(3); // good enough if expiration date will change only 1 time
    this.regenerateAPIKeyButton = page.getByRole('button', {
      name: 'Regenerate Key',
    });
    this.webhookURLInput = page.getByPlaceholder('URL');
    this.webhookDescription = page.getByPlaceholder('Write a description');
    this.webhookFilterObjectSelect = page
      .locator('div')
      .filter({ hasText: /^All Objects$/ })
      .nth(3); // works only for first filter
    this.webhookFilterActionSelect = page
      .locator('div')
      .filter({ hasText: /^All Actions$/ })
      .nth(3); // works only for first filter
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
  }

  async openDocumentation() {
    await this.readDocumentationButton.click();
  }

  async createAPIKey() {
    await this.createAPIKeyButton.click();
  }

  async typeAPIKeyName(name: string) {
    await this.nameOfAPIKeyInput.clear();
    await this.nameOfAPIKeyInput.fill(name);
  }

  async selectAPIExpirationDate(date: string) {
    await this.expirationDateAPIKeySelect.click();
    await this.page.getByText(date, { exact: true }).click();
  }

  async regenerateAPIKey() {
    await this.regenerateAPIKeyButton.click();
  }

  async deleteAPIKey() {
    await this.deleteButton.click();
  }

  async deleteWebhook() {
    await this.deleteButton.click();
  }

  async createWebhook() {
    await this.createWebhookButton.click();
  }

  async typeWebhookURL(url: string) {
    await this.webhookURLInput.fill(url);
  }

  async typeWebhookDescription(description: string) {
    await this.webhookDescription.fill(description);
  }

  async selectWebhookObject(object: string) {
    // TODO: finish
  }

  async selectWebhookAction(action: string) {
    // TODO: finish
  }

  async deleteWebhookFilter() {
    // TODO: finish
  }

  async clickCancelButton() {
    await this.cancelButton.click();
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }

  async checkAPIKeyDetails(name: string) {
    await this.page.locator(`//a/div[contains(.,'${name}')][first()]`).click();
  }

  async checkWebhookDetails(name: string) {
    await this.page.locator(`//a/div[contains(.,'${name}')][first()]`).click();
  }
}
