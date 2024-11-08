import { Locator, Page } from '@playwright/test';

export class EmailsSection {
  private readonly visibilityEverythingRadio: Locator;
  private readonly visibilitySubjectRadio: Locator;
  private readonly visibilityMetadataRadio: Locator;
  private readonly autoCreationReceivedRadio: Locator;
  private readonly autoCreationSentRadio: Locator;
  private readonly autoCreationNoneRadio: Locator;
  private readonly excludeNonProfessionalToggle: Locator;
  private readonly excludeGroupToggle: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.visibilityEverythingRadio = page.locator(
      'input[value="SHARE_EVERYTHING"]',
    );
    this.visibilitySubjectRadio = page.locator('input[value="SUBJECT"]');
    this.visibilityMetadataRadio = page.locator('input[value="METADATA"]');
    this.autoCreationReceivedRadio = page.locator(
      'input[value="SENT_AND_RECEIVED"]',
    );
    this.autoCreationSentRadio = page.locator('input[value="SENT"]');
    this.autoCreationNoneRadio = page.locator('input[value="NONE"]');
    // first checkbox is advanced settings toggle
    this.excludeNonProfessionalToggle = page.getByRole('checkbox').nth(1);
    this.excludeGroupToggle = page.getByRole('checkbox').nth(2);
  }

  async changeVisibilityToEverything() {
    await this.visibilityEverythingRadio.click();
  }

  async changeVisibilityToSubject() {
    await this.visibilitySubjectRadio.click();
  }

  async changeVisibilityToMetadata() {
    await this.visibilityMetadataRadio.click();
  }

  async changeAutoCreationToAll() {
    await this.autoCreationReceivedRadio.click();
  }

  async changeAutoCreationToSent() {
    await this.autoCreationSentRadio.click();
  }

  async changeAutoCreationToNone() {
    await this.autoCreationNoneRadio.click();
  }

  async toggleExcludeNonProfessional() {
    await this.excludeNonProfessionalToggle.click();
  }

  async toggleExcludeGroup() {
    await this.excludeGroupToggle.click();
  }
}
