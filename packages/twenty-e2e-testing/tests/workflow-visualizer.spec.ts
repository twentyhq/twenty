import { expect } from '@playwright/test';
import { test } from '../lib/fixtures/blank-workflow';

test('Create workflow with every possible step', async ({
  workflowVisualizer,
  page,
}) => {
  await workflowVisualizer.createInitialTrigger('record-created');

  await workflowVisualizer.createStep('create-record');
  await workflowVisualizer.createStep('update-record');
  await workflowVisualizer.createStep('delete-record');
  await workflowVisualizer.createStep('code');
  await workflowVisualizer.createStep('send-email');

  const workflowVisualizerBackground = page.locator('.react-flow__pane');

  await workflowVisualizerBackground.click();

  const draftWorkflowStatus =
    workflowVisualizer.workflowStatus.getByText('Draft');

  await expect(draftWorkflowStatus).toBeVisible();

  await workflowVisualizer.activateWorkflowButton.click();

  const activeWorkflowStatus =
    workflowVisualizer.workflowStatus.getByText('Active');

  await expect(draftWorkflowStatus).not.toBeVisible();
  await expect(activeWorkflowStatus).toBeVisible();
  await expect(workflowVisualizer.activateWorkflowButton).not.toBeVisible();
  await expect(workflowVisualizer.deactivateWorkflowButton).toBeVisible();
});

test('Delete steps from draft version', async ({
  workflowVisualizer,
  page,
}) => {
  await workflowVisualizer.createInitialTrigger('record-created');

  const { createdStepId: firstStepId } =
    await workflowVisualizer.createStep('create-record');
  const { createdStepId: secondStepId } =
    await workflowVisualizer.createStep('update-record');
  const { createdStepId: thirdStepId } =
    await workflowVisualizer.createStep('delete-record');
  const { createdStepId: fourthStepId } =
    await workflowVisualizer.createStep('code');
  const { createdStepId: fifthStepId } =
    await workflowVisualizer.createStep('send-email');

  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Create Record',
    'Update Record',
    'Delete Record',
    'Code - Serverless Function',
    'Send Email',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(5);

  await workflowVisualizer.deleteStep(firstStepId);

  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Update Record',
    'Delete Record',
    'Code - Serverless Function',
    'Send Email',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(4);

  await workflowVisualizer.deleteStep(fifthStepId);

  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Update Record',
    'Delete Record',
    'Code - Serverless Function',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(3);

  await workflowVisualizer.deleteStep(secondStepId);

  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Delete Record',
    'Code - Serverless Function',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(2);

  await workflowVisualizer.deleteStep(fourthStepId);

  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Delete Record',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);

  await workflowVisualizer.deleteStep(thirdStepId);

  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(0);

  await Promise.all([
    page.reload(),

    expect(workflowVisualizer.triggerNode).toBeVisible(),
  ]);

  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(0);
});
