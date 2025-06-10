import { Locator, Page } from '@playwright/test';

export class StripePage {
  private readonly cardNumberInput: Locator;
  private readonly cardExpiryInput: Locator;
  private readonly cardCvcInput: Locator;
  private readonly cardholderNameInput: Locator;
  private readonly startTrialButton: Locator;
  private readonly cancelSubscriptionButton: Locator;
  private readonly confirmButton: Locator;
  private readonly returnToTwentyLink: Locator;

  constructor(public readonly page: Page) {
    this.cardNumberInput = page.getByPlaceholder('1234 1234 1234 1234');
    this.cardExpiryInput = page.getByPlaceholder('MM / YY');
    this.cardCvcInput = page.getByPlaceholder('CVC');
    this.cardholderNameInput = page.getByPlaceholder('Full name on card');
    this.startTrialButton = page.getByTestId('hosted-payment-submit-button');
    this.cancelSubscriptionButton = page.locator(
      'a[data-test="cancel-subscription"]',
    );
    this.confirmButton = page.getByTestId('confirm');
    this.returnToTwentyLink = page.getByTestId('return-to-business-link');
  }

  async fillCardNumber(number: string) {
    await this.cardNumberInput.fill(number);
  }

  async fillCardExpiry(expiry: string) {
    await this.cardExpiryInput.fill(expiry);
  }

  async fillCardCvc(cvc: string) {
    await this.cardCvcInput.fill(cvc);
  }

  async fillCardholderName(name: string) {
    await this.cardholderNameInput.fill(name);
  }

  async startTrial() {
    await this.startTrialButton.click();
  }

  async clickCancelSubscription() {
    await this.cancelSubscriptionButton.click();
    await this.confirmButton.click();
    await this.page.getByTestId('cancellation_reason_cancel').click();
  }

  async returnToTwenty() {
    await this.returnToTwentyLink.click();
  }
}
