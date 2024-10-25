import { Locator, Page } from '@playwright/test';

export class generalSection {
  private readonly uploadImageButton: Locator;
  private readonly removeImageButton: Locator;
  private readonly workspaceNameField: Locator;
  private readonly supportSwitch: Locator;
  private readonly deleteWorkspaceButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.uploadImageButton = page.getByRole('button', { name: 'Upload' });
    this.removeImageButton = page.getByRole('button', { name: 'Remove' });
    this.workspaceNameField = page.getByPlaceholder('Apple');
    this.supportSwitch = page.getByRole('checkbox').nth(1);
    this.deleteWorkspaceButton = page.getByRole('button', {
      name: 'Delete workspace',
    });
  }

  async uploadProfileImage() {
    await this.uploadImageButton.click();
    // TODO: finish when utils are merged
  }

  async deleteProfileImage() {
    await this.removeImageButton.click();
  }

  async changeWorkspaceName(workspaceName: string) {
    await this.workspaceNameField.clear();
    await this.workspaceNameField.fill(workspaceName);
  }

  async changeSupportSwitchState() {
    await this.supportSwitch.click();
  }

  async deleteWorkSpace() {
    await this.deleteWorkspaceButton.click();
    // TODO: finish
  }
}
