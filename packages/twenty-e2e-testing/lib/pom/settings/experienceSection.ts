import { Locator, Page } from '@playwright/test';

export class ExperienceSection {
  private readonly lightThemeButton: Locator;
  private readonly darkThemeButton: Locator;
  private readonly timezoneDropdown: Locator;
  private readonly dateFormatDropdown: Locator;
  private readonly timeFormatDropdown: Locator;
  private readonly searchInput: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.lightThemeButton = page.getByText('AaLight'); // it works
    this.darkThemeButton = page.getByText('AaDark');
    this.timezoneDropdown = page.locator(
      '//span[contains(., "Time zone")]/../div/div/div',
    );
    this.dateFormatDropdown = page.locator(
      '//span[contains(., "Date format")]/../div/div/div',
    );
    this.timeFormatDropdown = page.locator(
      '//span[contains(., "Time format")]/../div/div/div',
    );
    this.searchInput = page.getByPlaceholder('Search');
  }

  async changeThemeToLight() {
    await this.lightThemeButton.click();
  }

  async changeThemeToDark() {
    await this.darkThemeButton.click();
  }

  async selectTimeZone(timezone: string) {
    await this.timezoneDropdown.click();
    await this.page.getByText(timezone, { exact: true }).click();
  }

  async selectTimeZoneWithSearch(timezone: string) {
    await this.timezoneDropdown.click();
    await this.searchInput.fill(timezone);
    await this.page.getByText(timezone, { exact: true }).click();
  }

  async selectDateFormat(dateFormat: string) {
    await this.dateFormatDropdown.click();
    await this.page.getByText(dateFormat, { exact: true }).click();
  }

  async selectTimeFormat(timeFormat: string) {
    await this.timeFormatDropdown.click();
    await this.page.getByText(timeFormat, { exact: true }).click();
  }
}
