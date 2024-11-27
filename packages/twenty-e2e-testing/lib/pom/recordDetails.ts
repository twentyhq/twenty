import { Locator, Page } from '@playwright/test';

export class RecordDetails {
  // TODO: add missing components in tasks, notes, files, emails, calendar tabs
  private readonly closeRecordButton: Locator;
  private readonly previousRecordButton: Locator;
  private readonly nextRecordButton: Locator;
  private readonly favoriteRecordButton: Locator;
  private readonly addShowPageButton: Locator;
  private readonly moreOptionsButton: Locator;
  private readonly deleteButton: Locator;
  private readonly uploadProfileImageButton: Locator;
  private readonly timelineTab: Locator;
  private readonly tasksTab: Locator;
  private readonly notesTab: Locator;
  private readonly filesTab: Locator;
  private readonly emailsTab: Locator;
  private readonly calendarTab: Locator;
  private readonly detachRelationButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
  }

  async clickCloseRecordButton() {
    await this.closeRecordButton.click();
  }

  async clickPreviousRecordButton() {
    await this.previousRecordButton.click();
  }

  async clickNextRecordButton() {
    await this.nextRecordButton.click();
  }

  async clickFavoriteRecordButton() {
    await this.favoriteRecordButton.click();
  }

  async createRelatedNote() {
    await this.addShowPageButton.click();
    await this.page
      .locator('//div[@data-testid="tooltip" and contains(., "Note")]')
      .click();
  }

  async createRelatedTask() {
    await this.addShowPageButton.click();
    await this.page
      .locator('//div[@data-testid="tooltip" and contains(., "Task")]')
      .click();
  }

  async clickMoreOptionsButton() {
    await this.moreOptionsButton.click();
  }

  async clickDeleteRecordButton() {
    await this.deleteButton.click();
  }

  async clickUploadProfileImageButton() {
    await this.uploadProfileImageButton.click();
  }

  async goToTimelineTab() {
    await this.timelineTab.click();
  }

  async goToTasksTab() {
    await this.tasksTab.click();
  }

  async goToNotesTab() {
    await this.notesTab.click();
  }

  async goToFilesTab() {
    await this.filesTab.click();
  }

  async goToEmailsTab() {
    await this.emailsTab.click();
  }

  async goToCalendarTab() {
    await this.calendarTab.click();
  }

  async clickField(name: string) {
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${name}']/../../../div[last()]/div/div`,
      )
      .click();
  }

  async clickFieldWithButton(name: string) {
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${name}']/../../../div[last()]/div/div`,
      )
      .hover();
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${name}']/../../../div[last()]/div/div[last()]/div/button`,
      )
      .click();
  }

  async clickRelationEditButton(name: string) {
    await this.page.getByRole('heading').filter({ hasText: name }).hover();
    await this.page
      .locator(`//header[contains(., "${name}")]/div[last()]/div/button`)
      .click();
  }

  async detachRelation(name: string) {
    await this.page.locator(`//a[contains(., "${name}")]`).hover();
    await this.page
      .locator(`, //a[contains(., "${name}")]/../div[last()]/div/div/button`)
      .hover();
    await this.detachRelationButton.click();
  }

  async deleteRelationRecord(name: string) {
    await this.page.locator(`//a[contains(., "${name}")]`).hover();
    await this.page
      .locator(`, //a[contains(., "${name}")]/../div[last()]/div/div/button`)
      .hover();
    await this.deleteButton.click();
  }

  async selectRelationRecord(name: string) {
    await this.page
      .locator(`//div[@data-testid="tooltip" and contains(., "${name}")]`)
      .click();
  }

  async searchRelationRecord(name: string) {
    await this.page.getByPlaceholder('Search').fill(name);
  }

  async createNewRelationRecord() {
    await this.page
      .locator('//div[@data-testid="tooltip" and contains(., "Add New")]')
      .click();
  }
}
