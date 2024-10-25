import { Locator, Page } from '@playwright/test';

export class LeftMenu {
  private readonly workspaceDropdown: Locator;
  private readonly leftMenu: Locator;
  private readonly searchSubTab: Locator;
  private readonly settingsTab: Locator;
  private readonly peopleTab: Locator;
  private readonly companiesTab: Locator;
  private readonly opportunitiesTab: Locator;
  private readonly opportunitiesTabAll: Locator;
  private readonly opportunitiesTabByStage: Locator;
  private readonly tasksTab: Locator;
  private readonly tasksTabAll: Locator;
  private readonly tasksTabByStatus: Locator;
  private readonly notesTab: Locator;
  private readonly rocketsTab: Locator;
  private readonly workflowsTab: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.workspaceDropdown = page.getByTestId('workspace-dropdown');
    this.leftMenu = page.getByRole('button').first();
    this.searchSubTab = page.getByText('Search');
    this.settingsTab = page.getByRole('link', { name: 'Settings' });
    this.peopleTab = page.getByRole('link', { name: 'People' });
    this.companiesTab = page.getByRole('link', { name: 'Companies' });
    this.opportunitiesTab = page.getByRole('link', { name: 'Opportunities' });
    this.opportunitiesTabAll = page.getByRole('link', {
      name: 'All',
      exact: true,
    });
    this.opportunitiesTabByStage = page.getByRole('link', { name: 'By Stage' });
    this.tasksTab = page.getByRole('link', { name: 'Tasks' });
    this.tasksTabAll = page.getByRole('link', { name: 'All tasks' });
    this.tasksTabByStatus = page.getByRole('link', { name: 'Notes' });
    this.notesTab = page.getByRole('link', { name: 'Notes' });
    this.rocketsTab = page.getByRole('link', { name: 'Rockets' });
    this.workflowsTab = page.getByRole('link', { name: 'Workflows' });
  }

  async selectWorkspace(workspaceName: string) {
    await this.workspaceDropdown.click();
    await this.page
      .getByTestId('tooltip')
      .filter({ hasText: workspaceName })
      .click();
  }

  async changeLeftMenu() {
    await this.leftMenu.click();
  }

  async openSearchTab() {
    await this.searchSubTab.click();
  }

  async goToSettings() {
    await this.settingsTab.click();
  }

  async goToPeopleTab() {
    await this.peopleTab.click();
  }

  async goToCompaniesTab() {
    await this.companiesTab.click();
  }

  async goToOpportunitiesTab() {
    await this.opportunitiesTab.click();
  }

  async goToOpportunitiesTableView() {
    await this.opportunitiesTabAll.click();
  }

  async goToOpportunitiesKanbanView() {
    await this.opportunitiesTabByStage.click();
  }

  async goToTasksTab() {
    await this.tasksTab.click();
  }

  async goToTasksTableView() {
    await this.tasksTabAll.click();
  }

  async goToTasksKanbanView() {
    await this.tasksTabByStatus.click();
  }

  async goToNotesTab() {
    await this.notesTab.click();
  }

  async goToRocketsTab() {
    await this.rocketsTab.click();
  }

  async goToWorkflowsTab() {
    await this.workflowsTab.click();
  }

  async goToCustomObject(customObjectName: string) {
    await this.page.getByRole('link', { name: customObjectName }).click();
  }

  async goToCustomObjectView(name: string) {
    await this.page.getByRole('link', { name: name }).click();
  }
}

export default LeftMenu;
