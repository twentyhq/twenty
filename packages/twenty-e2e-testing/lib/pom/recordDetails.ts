import { Locator, Page } from '@playwright/test';

export class RecordDetails {
  // hardest to implement
  constructor(public readonly page: Page) {
    this.page = page;
  }
}
