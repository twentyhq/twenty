import { Locator, Page, Expect } from '@playwright/test';

export class DevelopersSection {
  private readonly readDocumentationButton: Locator;
  private readonly createAPIKeyButton: Locator;
  private readonly regenerateAPIKeyButton: Locator;
  private readonly nameOfAPIKey: Locator;
  private readonly expirationDateAPIKey: Locator;
  private readonly createWebhookButton: Locator;
  private readonly webhookUrl: Locator;
  private readonly webhookDescription: Locator;
  private readonly webhookFilterObjectDropdown: Locator;
  private readonly webhookFilterActionDropdown: Locator;
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
    this.nameOfAPIKey = page
      .getByPlaceholder('E.g. backoffice integration')
      .first();
    this.expirationDateAPIKey = page
      .locator('div')
      .filter({ hasText: /^Never$/ })
      .nth(3);
    this.regenerateAPIKeyButton = page.getByRole('button', {
      name: 'Regenerate Key',
    });
    this.webhookUrl = page.getByPlaceholder('URL');
    this.webhookDescription = page.getByPlaceholder('Write a description');
    this.webhookFilterObjectDropdown = page
      .locator('div')
      .filter({ hasText: /^All Objects$/ })
      .nth(3);
    this.webhookFilterActionDropdown = page
      .locator('div')
      .filter({ hasText: /^All Actions$/ })
      .nth(3);
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
  }

  async openDocumentation() {
    await this.readDocumentationButton.click();
  }

  async createNewAPIKey() {
    await this.createAPIKeyButton.click();
  }

  async regenerateAPIKey() {
    await this.regenerateAPIKeyButton.click();
  }

  async deleteAPIKey() {
    await this.deleteButton.click();
  }

  async clickCancelButton() {
    await this.cancelButton.click();
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }


}
