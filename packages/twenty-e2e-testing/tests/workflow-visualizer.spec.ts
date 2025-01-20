import { expect } from '@playwright/test';
import { test } from '../lib/fixtures/blank-workflow';

test('Create workflow with every possible step', async ({
  workflowVisualizer,
  page,
}) => {
  const addTriggerButton = page.getByText('Add a Trigger');
  await addTriggerButton.click();

  const triggerOption = page.getByText('Record is Created');
  await triggerOption.click();

  const triggerNode = page.getByTestId('rf__node-trigger');
  await expect(triggerNode).toHaveClass(/selected/);
  await expect(triggerNode).toHaveText(/Record is Created/);

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
