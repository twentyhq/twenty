import { Locator, Page } from '@playwright/test';

export class RolesSection {
  private readonly page: Page;
  private readonly createRoleButton: Locator;
  private readonly defaultRoleDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createRoleButton = page.getByRole('button', { name: 'Create Role' });
    this.defaultRoleDropdown = page
      .getByText('Set a default for this workspace', { exact: true })
      .locator('xpath=../../..')
      .getByRole('button');
  }

  async clickCreateRoleButton() {
    await this.createRoleButton.click();
  }

  async selectDefaultRole(role: string) {
    await this.defaultRoleDropdown.click();
    await this.page.getByText(role, { exact: true }).click();
  }
}
