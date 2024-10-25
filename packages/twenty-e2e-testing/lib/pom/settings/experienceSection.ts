import { Locator, Page, expect } from '@playwright/test';

export class AppearanceSection {
  private readonly lightThemeButton: Locator;
  private readonly darkThemeButton: Locator;
  private readonly timezoneDropdown: Locator;
  private readonly timezoneOption: Locator;
  private readonly dateFormatDropdown: Locator;
  private readonly dateFormatOption: Locator;
  private readonly timeFormatDropdown: Locator;
  private readonly timeFormatOption: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.lightThemeButton = page.getByText('AaLight');
    this.darkThemeButton = page.getByText('AaDark');
    // add
    this.timezoneDropdown;
    this.dateFormatDropdown;
    this.timeFormatDropdown;
  }
}
