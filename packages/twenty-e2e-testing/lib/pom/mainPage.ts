import { Locator, Page } from '@playwright/test';

export class MainPage {
  // TODO: add missing elements (advanced filters, import/export popups)
  private readonly tableViews: Locator;
  private readonly addViewButton: Locator;
  private readonly viewIconSelect: Locator;
  private readonly viewNameInput: Locator;
  private readonly viewTypeSelect: Locator;
  private readonly createViewButton: Locator;
  private readonly deleteViewButton: Locator;
  private readonly filterButton: Locator;
  private readonly searchFieldInput: Locator;
  private readonly advancedFilterButton: Locator;
  private readonly addFilterButton: Locator;
  private readonly resetFilterButton: Locator;
  private readonly saveFilterAsViewButton: Locator;
  private readonly sortButton: Locator;
  private readonly sortOrderButton: Locator;
  private readonly optionsButton: Locator;
  private readonly fieldsButton: Locator;
  private readonly goBackButton: Locator;
  private readonly hiddenFieldsButton: Locator;
  private readonly editFieldsButton: Locator;
  private readonly importButton: Locator;
  private readonly exportButton: Locator;
  private readonly deletedRecordsButton: Locator;
  private readonly createNewRecordButton: Locator;
  private readonly addToFavoritesButton: Locator;
  private readonly deleteFromFavoritesButton: Locator;
  private readonly exportBottomBarButton: Locator;
  private readonly deleteRecordsButton: Locator;

  constructor(public readonly page: Page) {
    this.tableViews = page.getByText('·');
    this.addViewButton = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Add view$/ });
    this.viewIconSelect = page.getByLabel('Click to select icon (');
    this.viewNameInput; // can be selected using only actual value
    this.viewTypeSelect = page.locator(
      "//span[contains(., 'View type')]/../div",
    );
    this.createViewButton = page.getByRole('button', { name: 'Create' });
    this.deleteViewButton = page.getByRole('button', { name: 'Delete' });
    this.filterButton = page.getByText('Filter');
    this.searchFieldInput = page.getByPlaceholder('Search fields');
    this.advancedFilterButton = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Advanced filter$/ });
    this.addFilterButton = page.getByRole('button', { name: 'Add Filter' });
    this.resetFilterButton = page.getByTestId('cancel-button');
    this.saveFilterAsViewButton = page.getByRole('button', {
      name: 'Save as new view',
    });
    this.sortButton = page.getByText('Sort');
    this.sortOrderButton = page.locator('//li');
    this.optionsButton = page.getByText('Options');
    this.fieldsButton = page.getByText('Fields');
    this.goBackButton = page.getByTestId('dropdown-menu-header-end-icon');
    this.hiddenFieldsButton = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Hidden Fields$/ });
    this.editFieldsButton = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Edit Fields$/ });
    this.importButton = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Import$/ });
    this.exportButton = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Export$/ });
    this.deletedRecordsButton = page
      .getByTestId('tooltip')
      .filter({ hasText: /^Deleted */ });
    this.createNewRecordButton = page.getByTestId('add-button');
    this.addToFavoritesButton = page.getByText('Add to favorites');
    this.deleteFromFavoritesButton = page.getByText('Delete from favorites');
    this.exportBottomBarButton = page.getByText('Export');
    this.deleteRecordsButton = page.getByText('Delete');
  }

  async clickTableViews() {
    await this.tableViews.click();
  }

  async clickAddViewButton() {
    await this.addViewButton.click();
  }

  async typeViewName(name: string) {
    await this.viewNameInput.clear();
    await this.viewNameInput.fill(name);
  }

  // name can be either be 'Table' or 'Kanban'
  async selectViewType(name: string) {
    await this.viewTypeSelect.click();
    await this.page.getByTestId('tooltip').filter({ hasText: name }).click();
  }

  async createView() {
    await this.createViewButton.click();
  }

  async deleteView() {
    await this.deleteViewButton.click();
  }

  async clickFilterButton() {
    await this.filterButton.click();
  }

  async searchFields(name: string) {
    await this.searchFieldInput.clear();
    await this.searchFieldInput.fill(name);
  }

  async clickAdvancedFilterButton() {
    await this.advancedFilterButton.click();
  }

  async addFilter() {
    await this.addFilterButton.click();
  }

  async resetFilter() {
    await this.resetFilterButton.click();
  }

  async saveFilterAsView() {
    await this.saveFilterAsViewButton.click();
  }

  async clickSortButton() {
    await this.sortButton.click();
  }

  //can be Ascending or Descending
  async setSortOrder(name: string) {
    await this.sortOrderButton.click();
    await this.page.getByTestId('tooltip').filter({ hasText: name }).click();
  }

  async clickOptionsButton() {
    await this.optionsButton.click();
  }

  async clickFieldsButton() {
    await this.fieldsButton.click();
  }

  async clickBackButton() {
    await this.goBackButton.click();
  }

  async clickHiddenFieldsButton() {
    await this.hiddenFieldsButton.click();
  }

  async clickEditFieldsButton() {
    await this.editFieldsButton.click();
  }

  async clickImportButton() {
    await this.importButton.click();
  }

  async clickExportButton() {
    await this.exportButton.click();
  }

  async clickDeletedRecordsButton() {
    await this.deletedRecordsButton.click();
  }

  async clickCreateNewRecordButton() {
    await this.createNewRecordButton.click();
  }

  async clickAddToFavoritesButton() {
    await this.addToFavoritesButton.click();
  }

  async clickDeleteFromFavoritesButton() {
    await this.deleteFromFavoritesButton.click();
  }

  async clickExportBottomBarButton() {
    await this.exportBottomBarButton.click();
  }

  async clickDeleteRecordsButton() {
    await this.deleteRecordsButton.click();
  }
}
