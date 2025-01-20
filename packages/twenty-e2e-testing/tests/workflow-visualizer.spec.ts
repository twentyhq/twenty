import { expect } from '@playwright/test';
import { test } from '../lib/fixtures/blank-workflow';

test('Create simple workflow', async ({
  workflowVisualizer: _workflowVisualizer,
  page,
}) => {
  const addTriggerButton = page.getByText('Add a Trigger');
  await addTriggerButton.click();

  const triggerOption = page.getByText('Record is Created');
  await triggerOption.click();

  await expect(
    page.getByTestId('command-menu').getByRole('textbox'),
  ).toHaveValue('Record is Created');

  const triggerNode = page.getByTestId('rf__node-trigger');
  await expect(triggerNode).toHaveClass(/selected/);
  await expect(triggerNode).toHaveText(/Record is Created/);

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

test('Create workflow with every possible step', async ({
  workflowVisualizer: _workflowVisualizer,
  page,
}) => {
  const addTriggerButton = page.getByText('Add a Trigger');
  await addTriggerButton.click();

  const triggerOption = page.getByText('Record is Created');
  await triggerOption.click();

  const triggerNode = page.getByTestId('rf__node-trigger');
  await expect(triggerNode).toHaveClass(/selected/);
  await expect(triggerNode).toHaveText(/Record is Created/);

  const addStepButton = page.getByLabel('Add a step');

  {
    await addStepButton.click();

    const actionName = 'Create Record';

    const actionToCreateOption = page.getByText(actionName);

    await actionToCreateOption.click();

    await expect(
      page.getByTestId('command-menu').getByRole('textbox').first(),
    ).toHaveValue(actionName);

    const createdActionNode = page
      .locator('.react-flow__node.selected')
      .getByText(actionName);

    await expect(createdActionNode).toBeVisible();

    const selectedNodes = page.locator('.react-flow__node.selected');

    await expect(async () => {
      expect(await selectedNodes.count()).toBe(1);
    }).toPass();
  }

  {
    await addStepButton.click();

    const actionName = 'Update Record';

    const actionToCreateOption = page.getByText(actionName);

    await actionToCreateOption.click();

    await expect(
      page.getByTestId('command-menu').getByRole('textbox').first(),
    ).toHaveValue(actionName);

    const createdActionNode = page
      .locator('.react-flow__node.selected')
      .getByText(actionName);

    await expect(createdActionNode).toBeVisible();

    const selectedNodes = page.locator('.react-flow__node.selected');

    await expect(async () => {
      expect(await selectedNodes.count()).toBe(1);
    }).toPass();
  }

  {
    await addStepButton.click();

    const actionName = 'Delete Record';

    const actionToCreateOption = page.getByText(actionName);

    await actionToCreateOption.click();

    await expect(
      page.getByTestId('command-menu').getByRole('textbox').first(),
    ).toHaveValue(actionName);

    const createdActionNode = page
      .locator('.react-flow__node.selected')
      .getByText(actionName);

    await expect(createdActionNode).toBeVisible();

    const selectedNodes = page.locator('.react-flow__node.selected');

    await expect(async () => {
      expect(await selectedNodes.count()).toBe(1);
    }).toPass();
  }

  {
    await addStepButton.click();

    const actionName = 'Send Email';

    const actionToCreateOption = page.getByText(actionName);

    await actionToCreateOption.click();

    await expect(
      page.getByTestId('command-menu').getByRole('textbox').first(),
    ).toHaveValue(actionName);

    const createdActionNode = page
      .locator('.react-flow__node.selected')
      .getByText(actionName);

    await expect(createdActionNode).toBeVisible();

    const selectedNodes = page.locator('.react-flow__node.selected');

    await expect(async () => {
      expect(await selectedNodes.count()).toBe(1);
    }).toPass();
  }

  {
    await addStepButton.click();

    const actionName = 'Serverless Function';
    const createdActionName = 'Code - Serverless Function';

    const actionToCreateOption = page.getByText(actionName);

    await actionToCreateOption.click();

    await expect(
      page.getByTestId('command-menu').getByRole('textbox').first(),
    ).toHaveValue(createdActionName);

    const createdActionNode = page
      .locator('.react-flow__node.selected')
      .getByText(createdActionName);

    await expect(createdActionNode).toBeVisible();

    const selectedNodes = page.locator('.react-flow__node.selected');

    await expect(async () => {
      expect(await selectedNodes.count()).toBe(1);
    }).toPass();
  }

  const workflowStatusContainer = page.getByTestId(
    'workflow-visualizer-status',
  );

  const workflowVisualizerBackground = page.locator('.react-flow__pane');

  await workflowVisualizerBackground.click();

  const draftWorkflowStatus = workflowStatusContainer.getByText('Draft');

  await expect(draftWorkflowStatus).toBeVisible();

  const activateWorkflowButton = page.getByLabel('Activate Workflow', {
    exact: true,
  });

  await activateWorkflowButton.click();

  const activeWorkflowStatus = workflowStatusContainer.getByText('Active');

  const deactivateWorkflowButton = page.getByLabel('Deactivate Workflow', {
    exact: true,
  });

  await expect(draftWorkflowStatus).not.toBeVisible();
  await expect(activeWorkflowStatus).toBeVisible();
  await expect(activateWorkflowButton).not.toBeVisible();
  await expect(deactivateWorkflowButton).toBeVisible();
});
