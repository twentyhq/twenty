import { Locator, Page } from '@playwright/test';

export class FunctionsSection {
  private readonly newFunctionButton: Locator;
  private readonly functionNameInput: Locator;
  private readonly functionDescriptionInput: Locator;
  private readonly editorTab: Locator;
  private readonly codeEditorField: Locator;
  private readonly resetButton: Locator;
  private readonly publishButton: Locator;
  private readonly testButton: Locator;
  private readonly testTab: Locator;
  private readonly runFunctionButton: Locator;
  private readonly inputField: Locator;
  private readonly settingsTab: Locator;
  private readonly searchVariableInput: Locator;
  private readonly addVariableButton: Locator;
  private readonly nameVariableInput: Locator;
  private readonly valueVariableInput: Locator;
  private readonly cancelVariableButton: Locator;
  private readonly saveVariableButton: Locator;
  private readonly editVariableButton: Locator;
  private readonly deleteVariableButton: Locator;
  private readonly cancelButton: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButton: Locator;

  constructor(public readonly page: Page) {
    this.newFunctionButton = page.getByRole('button', { name: 'New Function' });
    this.functionNameInput = page.getByPlaceholder('Name');
    this.functionDescriptionInput = page.getByPlaceholder('Description');
    this.editorTab = page.getByTestId('tab-editor');
    this.codeEditorField = page.getByTestId('dummyInput'); // TODO: fix
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.testButton = page.getByRole('button', { name: 'Test' });
    this.testTab = page.getByTestId('tab-test');
    this.runFunctionButton = page.getByRole('button', { name: 'Run Function' });
    this.inputField = page.getByTestId('dummyInput'); // TODO: fix
    this.settingsTab = page.getByTestId('tab-settings');
    this.searchVariableInput = page.getByPlaceholder('Search a variable');
    this.addVariableButton = page.getByRole('button', { name: 'Add Variable' });
    this.nameVariableInput = page.getByPlaceholder('Name').nth(1);
    this.valueVariableInput = page.getByPlaceholder('Value');
    this.cancelVariableButton = page.locator('.css-uwqduk').first(); // TODO: fix
    this.saveVariableButton = page.locator('.css-uwqduk').nth(1); // TODO: fix
    this.editVariableButton = page.getByText('Edit', { exact: true });
    this.deleteVariableButton = page.getByText('Delete', { exact: true });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.deleteButton = page.getByRole('button', { name: 'Delete function' });
  }

  async clickNewFunction() {
    await this.newFunctionButton.click();
  }

  async typeFunctionName(name: string) {
    await this.functionNameInput.fill(name);
  }

  async typeFunctionDescription(description: string) {
    await this.functionDescriptionInput.fill(description);
  }

  async checkFunctionDetails(name: string) {
    await this.page.getByRole('link', { name: `${name} nodejs18.x` }).click();
  }

  async clickEditorTab() {
    await this.editorTab.click();
  }

  async clickResetButton() {
    await this.resetButton.click();
  }

  async clickPublishButton() {
    await this.publishButton.click();
  }

  async clickTestButton() {
    await this.testButton.click();
  }

  async typeFunctionCode() {
    // TODO: finish once utils are merged
  }

  async clickTestTab() {
    await this.testTab.click();
  }

  async runFunction() {
    await this.runFunctionButton.click();
  }

  async typeFunctionInput() {
    // TODO: finish once utils are merged
  }

  async clickSettingsTab() {
    await this.settingsTab.click();
  }

  async searchVariable(name: string) {
    await this.searchVariableInput.fill(name);
  }

  async addVariable() {
    await this.addVariableButton.click();
  }

  async typeVariableName(name: string) {
    await this.nameVariableInput.fill(name);
  }

  async typeVariableValue(value: string) {
    await this.valueVariableInput.fill(value);
  }

  async editVariable(name: string) {
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${name}')]/../../div[last()]/div/div/button`,
      )
      .click();
    await this.editVariableButton.click();
  }

  async deleteVariable(name: string) {
    await this.page
      .locator(
        `//div[@data-testid='tooltip' and contains(., '${name}')]/../../div[last()]/div/div/button`,
      )
      .click();
    await this.deleteVariableButton.click();
  }

  async cancelVariable() {
    await this.cancelVariableButton.click();
  }

  async saveVariable() {
    await this.saveVariableButton.click();
  }

  async clickCancelButton() {
    await this.cancelButton.click();
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }

  async clickDeleteButton() {
    await this.deleteButton.click();
  }
}
