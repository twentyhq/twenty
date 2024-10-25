import { Locator, Page } from '@playwright/test';

export class MainPage {
  // needs fixing
  readonly tableView: Locator;
  readonly tableViewAddView: Locator;
  readonly tableFilter: Locator;
  readonly tableSort: Locator;
  readonly tableOptions: Locator;
  readonly createIcon: Locator;

  constructor(page: Page) {
    this.tableView = page.getByText('·');
    this.tableViewAddView = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Add view$/ });
    this.tableFilter = page.getByText('Filter');
    this.tableSort = page.getByText('Sort');
    this.tableOptions = page.getByText('Options');
    this.createIcon = page.getByLabel('Click to select icon');
  }
}

export default MainPage;
