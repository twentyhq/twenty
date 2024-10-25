import { Locator, Page } from '@playwright/test';

export class DataModelSection {
  // to be finished
  private readonly addObjectButton: Locator;
  private readonly newObjectIcon: Locator;
  private readonly newObjectSingular: Locator;
  private readonly newObjectPlural: Locator;
  private readonly newObjectDescription: Locator;
  private readonly addFieldButton: Locator;
  private readonly cancelButton: Locator;
  private readonly saveButton: Locator;

  constructor(public readonly page: Page) {
    this.addObjectButton = page.getByRole('button', { name: 'Add object' });
    this.newObjectIcon = page.getByLabel('Click to select icon (');
    this.newObjectSingular = page.getByPlaceholder('Listing', { exact: true });
    this.newObjectPlural = page.getByPlaceholder('Listings');
    this.newObjectDescription = page.getByPlaceholder('Write a description');
    this.addFieldButton = page.getByRole('button', { name: 'Add field' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }
}
