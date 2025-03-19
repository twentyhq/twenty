import { Locator, Page } from '@playwright/test';

export class WebhooksSection {
  private readonly createWebhookButton: Locator;
  private readonly webhookURLInput: Locator;
  private readonly webhookDescription: Locator;
  private readonly deleteButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.createWebhookButton = page.getByRole('link', {
      name: 'Create Webhook',
    });
    this.webhookURLInput = page.getByPlaceholder('URL');
    this.webhookDescription = page.getByPlaceholder('Write a description');
    this.deleteButton = page.getByRole('button', { name: 'Delete' });
  }

  async deleteWebhook() {
    await this.deleteButton.click();
  }

  async createWebhook() {
    await this.createWebhookButton.click();
  }

  async typeWebhookURL(url: string) {
    await this.webhookURLInput.clear();
    await this.webhookURLInput.fill(url);
  }

  async typeWebhookDescription(description: string) {
    await this.webhookDescription.fill(description);
  }

  async selectWebhookObject(index: number, object: string) {
    await this.page
      .locator(
        `//div[aria-controls="object-webhook-type-select-${index}-options"]`,
      )
      .click();
    await this.page.getByRole('option').getByText(object).click();
  }

  async selectWebhookAction(index: number, action: string) {
    await this.page
      .locator(
        `//div[aria-controls="operation-webhook-type-select-${index}-options"]`,
      )
      .click();
    await this.page.getByRole('option').getByText(action).click();
  }

  async deleteWebhookFilter(index: number) {
    await this.page
      .locator(
        `//div[aria-controls="object-webhook-type-select-${index}-options"]/../..//button`,
      )
      .click();
  }

  async checkWebhookDetails(name: string) {
    await this.page.locator(`//a/div[contains(.,'${name}')][first()]`).click();
  }
}
