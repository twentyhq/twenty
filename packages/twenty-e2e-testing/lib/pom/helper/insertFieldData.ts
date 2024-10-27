import { Page } from '@playwright/test';

export class InsertFieldData {
  // TODO: use XPath as popups to insert data are in last div of body
  constructor(public readonly page: Page) {
    this.page = page;
  }
}
