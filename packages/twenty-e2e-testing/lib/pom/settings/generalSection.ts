import { Locator, Page } from '@playwright/test';

export class GeneralSection {
  private readonly workspaceNameField: Locator;
  private readonly supportSwitch: Locator;
  private readonly deleteWorkspaceButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.workspaceNameField = page.getByPlaceholder('Apple');
    this.supportSwitch = page.getByRole('checkbox').nth(1);
    this.deleteWorkspaceButton = page.getByRole('button', {
      name: 'Delete workspace',
    });
  }

  async changeWorkspaceName(workspaceName: string) {
    await this.workspaceNameField.clear();
    await this.workspaceNameField.fill(workspaceName);
  }

  async changeSupportSwitchState() {
    await this.supportSwitch.click();
  }

  async clickDeleteWorkSpaceButton() {
    await this.deleteWorkspaceButton.click();
  }
}
