import { Locator, Page } from '@playwright/test';

export class DataModelSection {
  // to be finished
  private readonly searchObjectInput: Locator;
  private readonly addObjectButton: Locator;
  private readonly objectIcon: Locator;
  private readonly objectSingularInput: Locator;
  private readonly objectPluralInput: Locator;
  private readonly objectDescription: Locator;
  private readonly synchronizeLabelAPIToggle: Locator;
  private readonly objectAPISingularNameInput: Locator;
  private readonly objectAPIPluralNameInput: Locator;
  private readonly objectMoreOptionsButton: Locator;
  private readonly editObjectButton: Locator;
  private readonly activateObjectButton: Locator;
  private readonly deleteObjectButton: Locator;
  private readonly activeSection: Locator;
  private readonly inactiveSection: Locator;
  private readonly addFieldButton: Locator;
  private readonly deactivateButton: Locator; // add attribute to make it one button
  private readonly activateButton: Locator;
  private readonly cancelButton: Locator;
  private readonly saveButton: Locator;

  constructor(public readonly page: Page) {
    this.addObjectButton = page.getByRole('button', { name: 'Add object' });
    this.objectIcon = page.getByLabel('Click to select icon (');
    this.objectSingularInput = page.getByPlaceholder('Listing', {
      exact: true,
    });
    this.objectPluralInput = page.getByPlaceholder('Listings');
    this.objectDescription = page.getByPlaceholder('Write a description');
    this.addFieldButton = page.getByRole('button', { name: 'Add field' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }
}
