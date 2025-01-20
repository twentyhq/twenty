import { expect } from '@playwright/test';
import { test } from '../lib/fixtures/blank-workflow';

test('Create simple workflow', async ({ workflowVisualizer, page }) => {
  const addTriggerButton = page.getByText('Add a Trigger');
  await addTriggerButton.click();

  const triggerOption = page.getByText('Database Event');
  await triggerOption.click();

  await expect(
    page.getByTestId('command-menu').getByRole('textbox'),
  ).toHaveValue('When a Company is Created');

  const triggerNode = page.getByTestId('rf__node-trigger');
  await expect(triggerNode).toHaveClass(/selected/);
  await expect(triggerNode).toHaveText(/Company is Created/);

  const addStepButton = page.getByLabel('Add a step');
  await addStepButton.click();

  const createRecordOption = page.getByText('Create Record');

  await createRecordOption.click();

  await expect(
    page.getByTestId('command-menu').getByRole('textbox').first(),
  ).toHaveValue('Create Record');

  const createRecordNode = page
    .locator('.react-flow__node.selected')
    .getByText('Create Record');
  await expect(createRecordNode).toBeVisible();
  await expect(triggerNode).not.toHaveClass(/selected/);
});
