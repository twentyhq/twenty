import { Locator, Page } from '@playwright/test';

export class IconSelect {
  private readonly iconSelectButton: Locator;
  private readonly iconSearchInput: Locator;

  constructor(public readonly page: Page) {
    this.iconSelectButton = page.getByLabel('Click to select icon (');
    this.iconSearchInput = page.getByPlaceholder('Search icon');
  }

  async selectIcon(name: string) {
    await this.iconSelectButton.click();
    await this.iconSearchInput.fill(name);
    await this.page.getByTitle(name).click();
  }

  async selectRelationIcon(name: string) {
    await this.iconSelectButton.nth(1).click();
    await this.iconSearchInput.fill(name);
    await this.page.getByTitle(name).click();
  }
}
