import { Locator, Page } from '@playwright/test';

export class DataModelSection {
  private readonly searchObjectInput: Locator;
  private readonly addObjectButton: Locator;
  private readonly objectIcon: Locator;
  private readonly objectSingularNameInput: Locator;
  private readonly objectPluralNameInput: Locator;
  private readonly objectDescription: Locator;
  private readonly synchronizeLabelAPIToggle: Locator;
  private readonly objectAPISingularNameInput: Locator;
  private readonly objectAPIPluralNameInput: Locator;
  private readonly objectMoreOptionsButton: Locator;
  private readonly editObjectButton: Locator;
  private readonly deleteObjectButton: Locator;
  private readonly activeSection: Locator;
  private readonly inactiveSection: Locator;
  private readonly searchFieldInput: Locator;
  private readonly addFieldButton: Locator;
  private readonly viewFieldDetailsMoreOptionsButton: Locator;
  private readonly searchTypeFieldInput: Locator;
  private readonly currencyFieldLink: Locator;
  private readonly currencyDefaultUnitSelect: Locator;
  private readonly emailsFieldLink: Locator;
  private readonly linksFieldLink: Locator;
  private readonly phonesFieldLink: Locator;
  private readonly addressFieldLink: Locator;
  private readonly textFieldLink: Locator;
  private readonly numberFieldLink: Locator;
  private readonly decreaseDecimalsButton: Locator;
  private readonly decimalsNumberInput: Locator;
  private readonly increaseDecimalsButton: Locator;
  private readonly booleanFieldLink: Locator;
  private readonly defaultBooleanSelect: Locator;
  private readonly dateTimeFieldLink: Locator;
  private readonly dateFieldLink: Locator;
  private readonly relativeDateToggle: Locator;
  private readonly selectFieldLink: Locator;
  private readonly multiSelectFieldLink: Locator;
  private readonly setAsDefaultOptionButton: Locator;
  private readonly removeOptionButton: Locator;
  private readonly addOptionButton: Locator;
  private readonly ratingFieldLink: Locator;
  private readonly JSONFieldLink: Locator;
  private readonly arrayFieldLink: Locator;
  private readonly relationFieldLink: Locator;
  private readonly relationTypeSelect: Locator;
  private readonly objectDestinationSelect: Locator;
  private readonly relationIconSelect: Locator;
  private readonly relationFieldNameInput: Locator;
  private readonly fullNameFieldLink: Locator;
  private readonly UUIDFieldLink: Locator;
  private readonly iconFieldSelect: Locator;
  private readonly nameFieldInput: Locator;
  private readonly descriptionFieldInput: Locator;
  private readonly deactivateMoreOptionsButton: Locator;
  private readonly activateMoreOptionsButton: Locator;
  private readonly deactivateButton: Locator; // TODO: add attribute to make it one button
  private readonly activateButton: Locator;
  private readonly cancelButton: Locator;
  private readonly saveButton: Locator;

  constructor(public readonly page: Page) {
    this.searchObjectInput = page.getByPlaceholder('Search an object...');
    this.addObjectButton = page.getByRole('button', { name: 'Add object' });
    this.objectIcon = page.getByLabel('Click to select icon (');
    this.objectSingularNameInput = page.getByPlaceholder('Listing', {
      exact: true,
    });
    this.objectPluralNameInput = page.getByPlaceholder('Listings', {
      exact: true,
    });
    this.objectDescription = page.getByPlaceholder('Write a description');
    this.synchronizeLabelAPIToggle = page.getByRole('checkbox').nth(1);
    this.objectAPISingularNameInput = page.getByPlaceholder('listing', {
      exact: true,
    });
    this.objectAPIPluralNameInput = page.getByPlaceholder('listings', {
      exact: true,
    });
    this.objectMoreOptionsButton = page.getByLabel('Object Options');
    this.editObjectButton = page.getByTestId('tooltip').getByText('Edit');
    this.deactivateMoreOptionsButton = page
      .getByTestId('tooltip')
      .getByText('Deactivate');
    this.activateMoreOptionsButton = page
      .getByTestId('tooltip')
      .getByText('Activate');
    this.deleteObjectButton = page.getByTestId('tooltip').getByText('Delete');
    this.activeSection = page.getByText('Active', { exact: true });
    this.inactiveSection = page.getByText('Inactive');
    this.searchFieldInput = page.getByPlaceholder('Search a field...');
    this.addFieldButton = page.getByRole('button', { name: 'Add field' });
    this.viewFieldDetailsMoreOptionsButton = page
      .getByTestId('tooltip')
      .getByText('View');
    this.searchTypeFieldInput = page.getByPlaceholder('Search a type');
    this.currencyFieldLink = page.getByRole('link', { name: 'Currency' });
    this.currencyDefaultUnitSelect = page.locator(
      "//span[contains(., 'Default Unit')]/../div",
    );
    this.emailsFieldLink = page.getByRole('link', { name: 'Emails' }).nth(1);
    this.linksFieldLink = page.getByRole('link', { name: 'Links' });
    this.phonesFieldLink = page.getByRole('link', { name: 'Phones' });
    this.addressFieldLink = page.getByRole('link', { name: 'Address' });
    this.textFieldLink = page.getByRole('link', { name: 'Text' });
    this.numberFieldLink = page.getByRole('link', { name: 'Number' });
    this.decreaseDecimalsButton = page.locator(
      "//div[contains(., 'Number of decimals')]/../div[last()]/div/div/button[2]",
    );
    this.decimalsNumberInput = page.locator(
      // would be better if first div was span tag
      "//div[contains(., 'Number of decimals')]/../div[last()]/div/div/div/div/input[2]",
    );
    this.increaseDecimalsButton = page.locator(
      "//div[contains(., 'Number of decimals')]/../div[last()]/div/div/button[3]",
    );
    this.booleanFieldLink = page.getByRole('link', { name: 'True/False' });
    this.defaultBooleanSelect = page.locator(
      "//span[contains(., 'Default Value')]/../div",
    );
    this.dateTimeFieldLink = page.getByRole('link', { name: 'Date and Time' });
    this.dateFieldLink = page.getByRole('link', { name: 'Date' });
    this.relativeDateToggle = page.getByRole('checkbox').nth(1);
    this.selectFieldLink = page.getByRole('link', { name: 'Select' });
    this.multiSelectFieldLink = page.getByRole('link', {
      name: 'Multi-select',
    });
    this.setAsDefaultOptionButton = page
      .getByTestId('tooltip')
      .getByText('Set as default');
    this.removeOptionButton = page
      .getByTestId('tooltip')
      .getByText('Remove option');
    this.addOptionButton = page.getByRole('button', { name: 'Add option' });
    this.ratingFieldLink = page.getByRole('link', { name: 'Rating' });
    this.JSONFieldLink = page.getByRole('link', { name: 'JSON' });
    this.arrayFieldLink = page.getByRole('link', { name: 'Array' });
    this.relationFieldLink = page.getByRole('link', { name: 'Relation' });
    this.relationTypeSelect = page.locator(
      "//span[contains(., 'Relation type')]/../div",
    );
    this.objectDestinationSelect = page.locator(
      "//span[contains(., 'Object destination')]/../div",
    );
    this.relationIconSelect = page.getByLabel('Click to select icon (').nth(1);
    this.relationFieldNameInput = page.getByPlaceholder('Field name');
    this.fullNameFieldLink = page.getByRole('link', { name: 'Full Name' });
    this.UUIDFieldLink = page.getByRole('link', { name: 'Unique ID' });
    this.iconFieldSelect = page.getByLabel('Click to select icon (');
    this.nameFieldInput = page.getByPlaceholder('Employees');
    this.descriptionFieldInput = page.getByPlaceholder('Write a description');
    this.deactivateButton = page.getByRole('button', { name: 'Deactivate' });
    this.activateButton = page.getByRole('button', { name: 'Activate' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async searchObject(name: string) {
    await this.searchObjectInput.fill(name);
  }

  async clickAddObjectButton() {
    await this.addObjectButton.click();
  }

  async selectObjectIcon(name: string) {
    await this.objectIcon.click();
    // TODO: finish
  }

  async typeObjectSingularName(name: string) {
    await this.objectSingularNameInput.fill(name);
  }

  async typeObjectPluralName(name: string) {
    await this.objectPluralNameInput.fill(name);
  }

  async typeObjectDescription(name: string) {
    await this.objectDescription.fill(name);
  }

  async toggleSynchronizeLabelAPI() {
    await this.synchronizeLabelAPIToggle.click();
  }

  async typeObjectSingularAPIName(name: string) {
    await this.objectAPISingularNameInput.fill(name);
  }

  async typeObjectPluralAPIName(name: string) {
    await this.objectAPIPluralNameInput.fill(name);
  }

  async checkObjectDetails(name: string) {
    await this.page.getByRole('link').filter({ hasText: name }).click();
  }

  async activateInactiveObject(name: string) {
    await this.page
      .locator(`//div[@title="${name}"]/../../div[last()]`)
      .click();
    await this.activateButton.click();
  }

  // object can be deleted only if is custom and inactive
  async deleteInactiveObject(name: string) {
    await this.page
      .locator(`//div[@title="${name}"]/../../div[last()]`)
      .click();
    await this.deleteObjectButton.click();
  }

  async editObjectDetails() {
    await this.objectMoreOptionsButton.click();
    await this.editObjectButton.click();
  }

  async deactivateObjectWithMoreOptions() {
    await this.objectMoreOptionsButton.click();
    await this.deactivateButton.click();
  }

  async searchField(name: string) {
    await this.searchFieldInput.fill(name);
  }

  async checkFieldDetails(name: string) {
    await this.page.locator(`//div[@title="${name}"]`).click();
  }

  async checkFieldDetailsWithButton(name: string) {
    await this.page
      .locator(`//div[@title="${name}"]/../../div[last()]`)
      .click();
    await this.viewFieldDetailsMoreOptionsButton.click();
  }

  async deactivateFieldWithButton(name: string) {
    await this.page
      .locator(`//div[@title="${name}"]/../../div[last()]`)
      .click();
    await this.deactivateMoreOptionsButton.click();
  }

  async activateFieldWithButton(name: string) {
    await this.page
      .locator(`//div[@title="${name}"]/../../div[last()]`)
      .click();
    await this.activateMoreOptionsButton.click();
  }

  async clickAddFieldButton() {
    await this.addFieldButton.click();
  }

  async searchTypeField(name: string) {
    await this.searchTypeFieldInput.fill(name);
  }

  async clickCurrencyType() {
    await this.currencyFieldLink.click();
  }

  async selectDefaultUnit(name: string) {
    await this.currencyDefaultUnitSelect.click();
    await this.page.getByTestId('tooltip').filter({ hasText: name }).click();
  }

  async clickEmailsType() {
    await this.emailsFieldLink.click();
  }

  async clickLinksType() {
    await this.linksFieldLink.click();
  }

  async clickPhonesType() {
    await this.phonesFieldLink.click();
  }

  async clickAddressType() {
    await this.addressFieldLink.click();
  }

  async clickTextType() {
    await this.textFieldLink.click();
  }

  async clickNumberType() {
    await this.numberFieldLink.click();
  }

  async decreaseDecimals() {
    await this.decreaseDecimalsButton.click();
  }

  async typeNumberOfDecimals(amount: number) {
    await this.decimalsNumberInput.fill(String(amount));
  }

  async increaseDecimals() {
    await this.increaseDecimalsButton.click();
  }

  async clickBooleanType() {
    await this.booleanFieldLink.click();
  }

  // either True of False
  async selectDefaultBooleanValue(value: string) {
    await this.defaultBooleanSelect.click();
    await this.page.getByTestId('tooltip').filter({ hasText: value }).click();
  }

  async clickDateTimeType() {
    await this.dateTimeFieldLink.click();
  }

  async clickDateType() {
    await this.dateFieldLink.click();
  }

  async toggleRelativeDate() {
    await this.relativeDateToggle.click();
  }

  async clickSelectType() {
    await this.selectFieldLink.click();
  }

  async clickMultiSelectType() {
    await this.multiSelectFieldLink.click();
  }

  async addSelectOption() {
    await this.addOptionButton.click();
  }

  async setOptionAsDefault() {
    // TODO: finish
    await this.setAsDefaultOptionButton.click();
  }

  async deleteSelectOption() {
    // TODO: finish
    await this.removeOptionButton.click();
  }

  async changeOptionAPIName() {
    // TODO: finish
  }

  async changeOptionColor() {
    // TODO: finish
  }

  async changeOptionName() {
    // TODO: finish
  }

  async clickRatingType() {
    await this.ratingFieldLink.click();
  }

  async clickJSONType() {
    await this.JSONFieldLink.click();
  }

  async clickArrayType() {
    await this.arrayFieldLink.click();
  }

  async clickRelationType() {
    await this.relationFieldLink.click();
  }

  // either 'Has many' or 'Belongs to one'
  async selectRelationType(name: string) {
    await this.relationTypeSelect.click();
    await this.page.getByTestId('tooltip').filter({ hasText: name }).click();
  }

  async selectObjectDestination(name: string) {
    await this.objectDestinationSelect.click();
    await this.page.getByTestId('tooltip').filter({ hasText: name }).click();
  }

  async selectRelationIcon(name: string) {
    await this.relationIconSelect.click();
    // TODO: finish
  }

  async typeRelationName(name: string) {
    await this.relationFieldNameInput.clear();
    await this.relationFieldNameInput.fill(name);
  }

  async clickFullNameType() {
    await this.fullNameFieldLink.click();
  }

  async clickUUIDType() {
    await this.UUIDFieldLink.click();
  }

  async selectFieldIcon(name: string) {
    await this.iconFieldSelect.click();
    // TODO: finish
  }

  async typeFieldName(name: string) {
    await this.nameFieldInput.clear();
    await this.nameFieldInput.fill(name);
  }

  async typeFieldDescription(description: string) {
    await this.descriptionFieldInput.clear();
    await this.descriptionFieldInput.fill(description);
  }

  async clickInactiveSection() {
    await this.inactiveSection.click();
  }

  async clickActiveSection() {
    await this.activeSection.click();
  }

  async clickCancelButton() {
    await this.cancelButton.click();
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }
}
