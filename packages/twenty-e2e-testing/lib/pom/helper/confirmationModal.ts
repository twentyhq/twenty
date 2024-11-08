import { Locator, Page } from '@playwright/test';

export class ConfirmationModal {
  private readonly input: Locator;
  private readonly cancelButton: Locator;
  private readonly confirmButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.input = page.getByTestId('confirmation-modal-input');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.confirmButton = page.getByTestId('confirmation-modal-confirm-button');
  }

  async typePlaceholderToInput() {
    await this.page
      .getByTestId('confirmation-modal-input')
      .fill(
        await this.page
          .getByTestId('confirmation-modal-input')
          .getAttribute('placeholder'),
      );
  }

  async typePhraseToInput(value: string) {
    await this.page.getByTestId('confirmation-modal-input').fill(value);
  }

  async clickCancelButton() {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }

  async clickConfirmButton() {
    await this.page.getByTestId('confirmation-modal-confirm-button').click();
  }
}
