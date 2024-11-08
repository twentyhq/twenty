import { Locator, Page } from '@playwright/test';

export class ProfileSection {
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly changePasswordButton: Locator;
  private readonly deleteAccountButton: Locator;

  constructor(public readonly page: Page) {
    this.page = page;
    this.firstNameField = page.getByPlaceholder('Tim');
    this.lastNameField = page.getByPlaceholder('Cook');
    this.emailField = page.getByRole('textbox').nth(2);
    this.changePasswordButton = page.getByRole('button', {
      name: 'Change Password',
    });
    this.deleteAccountButton = page.getByRole('button', {
      name: 'Delete account',
    });
  }

  async changeFirstName(firstName: string) {
    await this.firstNameField.clear();
    await this.firstNameField.fill(firstName);
  }

  async changeLastName(lastName: string) {
    await this.lastNameField.clear();
    await this.lastNameField.fill(lastName);
  }

  async getEmail() {
    await this.emailField.textContent();
  }

  async sendChangePasswordEmail() {
    await this.changePasswordButton.click();
  }

  async deleteAccount() {
    await this.deleteAccountButton.click();
  }
}
