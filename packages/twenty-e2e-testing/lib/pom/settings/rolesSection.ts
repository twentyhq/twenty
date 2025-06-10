import { Locator, Page } from '@playwright/test';

export class RolesSection {
  private readonly page: Page;
  private readonly createRoleButton: Locator;
  private readonly defaultRoleDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createRoleButton = page.getByRole('button', { name: 'Create Role' });
    this.defaultRoleDropdown = page.getByTestId('tooltip');
  }

  async clickCreateRoleButton() {
    await this.createRoleButton.click();
  }

  async selectDefaultRole(role: string) {
    await this.defaultRoleDropdown.click();
    await this.page.getByTestId('tooltip').getByText(role).click();
  }
}
