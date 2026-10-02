import { Locator, Page } from '@playwright/test';

export class UploadImage {
  private readonly imagePreview: Locator;
  private readonly uploadButton: Locator;
  private readonly removeButton: Locator;

  constructor(public readonly page: Page) {
    const uploadButtons = page.getByRole('button', {
      name: 'Upload',
      exact: true,
    });

    this.imagePreview = uploadButtons.filter({ hasNotText: 'Upload' });
    this.uploadButton = uploadButtons.filter({ hasText: 'Upload' });
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
