import { Locator, Page } from '@playwright/test';
import { formatDate } from './formatDate.function';

export class InsertFieldData {
  private readonly address1Input: Locator;
  private readonly address2Input: Locator;
  private readonly cityInput: Locator;
  private readonly stateInput: Locator;
  private readonly postCodeInput: Locator;
  private readonly countrySelect: Locator;
  private readonly arrayValueInput: Locator;
  private readonly arrayAddValueButton: Locator;
  // boolean react after click so no need to write special locator
  private readonly currencySelect: Locator;
  private readonly currencyAmountInput: Locator;
  private readonly monthSelect: Locator;
  private readonly yearSelect: Locator;
  private readonly previousMonthButton: Locator;
  private readonly nextMonthButton: Locator;
  private readonly clearDateButton: Locator;
  private readonly dateInput: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly addURLButton: Locator;
  private readonly setAsPrimaryButton: Locator;
  private readonly addPhoneButton: Locator;
  private readonly addMailButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.address1Input = page.locator(
      '//label[contains(., "ADDRESS 1")]/../div[last()]/input',
    );
    this.address2Input = page.locator(
      '//label[contains(., "ADDRESS 2")]/../div[last()]/input',
    );
    this.cityInput = page.locator(
      '//label[contains(., "CITY")]/../div[last()]/input',
    );
    this.stateInput = page.locator(
      '//label[contains(., "STATE")]/../div[last()]/input',
    );
    this.postCodeInput = page.locator(
      '//label[contains(., "POST CODE")]/../div[last()]/input',
    );
    this.countrySelect = page.locator(
      '//span[contains(., "COUNTRY")]/../div[last()]/div',
    );
    this.arrayValueInput = page.locator("//input[@placeholder='Enter value']");
    this.arrayAddValueButton = page.locator(
      "//div[@data-testid='tooltip' and contains(.,'Add item')]",
    );
    this.currencySelect = page.locator(
      '//body/div[last()]/div/div/div[first()]/div/div',
    );
    this.currencyAmountInput = page.locator("//input[@placeholder='Currency']");
    this.monthSelect; // TODO: add once some other attributes are added
    this.yearSelect;
    this.previousMonthButton;
    this.nextMonthButton;
    this.clearDateButton = page.locator(
      "//div[@data-testid='tooltip' and contains(., 'Clear')]",
    );
    this.dateInput = page.locator("//input[@placeholder='Type date and time']");
    this.firstNameInput = page.locator("//input[@placeholder='First name']"); // may fail if placeholder is `F&zwnj;&zwnj;irst name` instead of `First name`
    this.lastNameInput = page.locator("//input[@placeholder='Last name']"); // may fail if placeholder is `L&zwnj;&zwnj;ast name` instead of `Last name`
    this.addURLButton = page.locator(
      "//div[@data-testid='tooltip' and contains(., 'Add URL')]",
    );
    this.setAsPrimaryButton = page.locator(
      "//div[@data-testid='tooltip' and contains(., 'Set as primary')]",
    );
    this.addPhoneButton = page.locator(
      "//div[@data-testid='tooltip' and contains(., 'Add Phone')]",
    );
    this.addMailButton = page.locator(
      "//div[@data-testid='tooltip' and contains(., 'Add Email')]",
    );
  }

  // address
  async typeAddress1(value: string) {
    await this.address1Input.fill(value);
  }

  async typeAddress2(value: string) {
    await this.address2Input.fill(value);
  }

  async typeCity(value: string) {
    await this.cityInput.fill(value);
  }

  async typeState(value: string) {
    await this.stateInput.fill(value);
  }

  async typePostCode(value: string) {
    await this.postCodeInput.fill(value);
  }

  async selectCountry(value: string) {
    await this.countrySelect.click();
    await this.page
      .locator(`//div[@data-testid='tooltip' and contains(., '${value}')]`)
      .click();
  }

  // array
  async typeArrayValue(value: string) {
    await this.arrayValueInput.fill(value);
  }

  async clickAddItemButton() {
    await this.arrayAddValueButton.click();
  }

  // currency
  async selectCurrency(value: string) {
    await this.currencySelect.click();
    await this.page
      .locator(`//div[@data-testid='tooltip' and contains(., '${value}')]`)
      .click();
  }

  async typeCurrencyAmount(value: string) {
    await this.currencyAmountInput.fill(value);
  }

  // date(-time)
  async typeDate(value: string) {
    await this.dateInput.fill(value);
  }

  async selectMonth(value: string) {
    await this.monthSelect.click();
    await this.page
      .locator(`//div[@data-testid='tooltip' and contains(., '${value}')]`)
      .click();
  }

  async selectYear(value: string) {
    await this.yearSelect.click();
    await this.page
      .locator(`//div[@data-testid='tooltip' and contains(., '${value}')]`)
      .click();
  }

  async clickPreviousMonthButton() {
    await this.previousMonthButton.click();
  }

  async clickNextMonthButton() {
    await this.nextMonthButton.click();
  }

  async selectDay(value: string) {
    await this.page
      .locator(`//div[@aria-label='${formatDate(value)}']`)
      .click();
  }

  async clearDate() {
    await this.clearDateButton.click();
  }

  // email
  async typeEmail(value: string) {
    await this.page.locator(`//input[@placeholder='Email']`).fill(value);
  }

  async clickAddMailButton() {
    await this.addMailButton.click();
  }

  // full name
  async typeFirstName(name: string) {
    await this.firstNameInput.fill(name);
  }

  async typeLastName(name: string) {
    await this.lastNameInput.fill(name);
  }

  // JSON
  // placeholder is dependent on the name of field
  async typeJSON(placeholder: string, value: string) {
    await this.page
      .locator(`//input[@placeholder='${placeholder}']`)
      .fill(value);
  }

  // link
  async typeLink(value: string) {
    await this.page.locator("//input[@placeholder='URL']").fill(value);
  }

  async clickAddURL() {
    await this.addURLButton.click();
  }

  // (multi-)select
  async selectValue(value: string) {
    await this.page
      .locator(`//div[@data-testid='tooltip' and contains(., '${value}')]`)
      .click();
  }

  // number
  // placeholder is dependent on the name of field
  async typeNumber(placeholder: string, value: string) {
    await this.page
      .locator(`//input[@placeholder='${placeholder}']`)
      .fill(value);
  }

  // phones
  async selectCountryPhoneCode(countryCode: string) {
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${countryCode}')]`,
      )
      .click();
  }

  async typePhoneNumber(value: string) {
    await this.page.locator(`//input[@placeholder='Phone']`).fill(value);
  }

  async clickAddPhoneButton() {
    await this.addPhoneButton.click();
  }

  // rating
  // if adding rating for the first time, hover must be used
  async selectRating(rating: number) {
    await this.page.locator(`//div[@role='slider']/div[${rating}]`).click();
  }

  // text
  // placeholder is dependent on the name of field
  async typeText(placeholder: string, value: string) {
    await this.page
      .locator(`//input[@placeholder='${placeholder}']`)
      .fill(value);
  }

  async clickSetAsPrimaryButton() {
    await this.setAsPrimaryButton.click();
  }

  async searchValue(value: string) {
    await this.page.locator(`//div[@placeholder='Search']`).fill(value);
  }

  async clickEditButton() {
    await this.page
      .locator("//div[@data-testid='tooltip' and contains(., 'Edit')]")
      .click();
  }

  async clickDeleteButton() {
    await this.page
      .locator("//div[@data-testid='tooltip' and contains(., 'Delete')]")
      .click();
  }
}
