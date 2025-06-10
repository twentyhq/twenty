import { Locator, Page } from '@playwright/test';

export class NewFieldSection {
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
  private readonly nameFieldInput: Locator;
  private readonly descriptionFieldInput: Locator;

  constructor(public readonly page: Page) {
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
    this.nameFieldInput = page.getByPlaceholder('Employees');
    this.descriptionFieldInput = page.getByPlaceholder('Write a description');
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
    await this.page.getByTitle(name).click();
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

  async typeFieldName(name: string) {
    await this.nameFieldInput.clear();
    await this.nameFieldInput.fill(name);
  }

  async typeFieldDescription(description: string) {
    await this.descriptionFieldInput.clear();
    await this.descriptionFieldInput.fill(description);
  }
}
