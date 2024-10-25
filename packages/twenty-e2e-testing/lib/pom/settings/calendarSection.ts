import { Locator, Page } from '@playwright/test';

export class CalendarSection {
  private readonly eventVisibilityEverythingOption: Locator;
  private readonly eventVisibilityMetadataOption: Locator;
  private readonly contactAutoCreation: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.eventVisibilityEverythingOption = page.locator(
      'input[value="SHARE_EVERYTHING"]',
    );
    this.eventVisibilityMetadataOption = page.locator(
      'input[value="METADATA"]',
    );
    this.contactAutoCreation = page.getByRole('checkbox').nth(1);
  }

  async changeVisibilityToEverything() {
    await this.eventVisibilityEverythingOption.click();
  }

  async changeVisibilityToMetadata() {
    await this.eventVisibilityMetadataOption.click();
  }

  async toggleAutoCreation() {
    await this.contactAutoCreation.click();
  }
}
