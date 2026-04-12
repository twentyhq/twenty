import { Locator, Page } from '@playwright/test';

export class UploadImage {
  private readonly imagePreview: Locator;
  private readonly uploadButton: Locator;
  private readonly removeButton: Locator;

  constructor(public readonly page: Page) {
    this.imagePreview = page.getByTestId('workspace-member-picture-preview');
    this.uploadButton = page.getByRole('button', { name: 'Upload' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
  }

  async clickImagePreview() {
    await this.imagePreview.click();
  }

  async clickUploadButton() {
    await this.uploadButton.click();
  }

  async clickRemoveButton() {
    await this.removeButton.click();
  }
}
