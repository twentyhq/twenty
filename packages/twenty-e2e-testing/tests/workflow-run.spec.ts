import { expect } from '@playwright/test';
import { test } from '../lib/fixtures/blank-workflow';

test('The workflow run visualizer shows the executed draft version without the last draft changes', async ({
  workflowVisualizer,
  page,
}) => {
  await workflowVisualizer.createInitialTrigger('manual');

  const manualTriggerAvailabilitySelect = page.getByRole('button', {
    name: 'When record(s) are selected',
  });

  await manualTriggerAvailabilitySelect.click();

  const alwaysAvailableOption = page.getByText(
    'When no record(s) are selected',
  );

  await alwaysAvailableOption.click();

  await workflowVisualizer.closeSidePanel();

  const { createdStepId: firstStepId } =
    await workflowVisualizer.createStep('create-record');

  await workflowVisualizer.closeSidePanel();

  const launchTestButton = page.getByLabel(workflowVisualizer.workflowName);

  await launchTestButton.click();

  const goToExecutionPageLink = page.getByRole('link', {
    name: 'View execution details',
  });
  const executionPageUrl = await goToExecutionPageLink.getAttribute('href');
  expect(executionPageUrl).not.toBeNull();

  await workflowVisualizer.deleteStep(firstStepId);

  await page.goto(executionPageUrl!);

  const workflowRunName = page
    .getByText(`#1 - ${workflowVisualizer.workflowName}`)
    .nth(1);

  await expect(workflowRunName).toBeVisible();

  const executedFirstStepNode = workflowVisualizer.getStepNode(firstStepId);

  await expect(executedFirstStepNode).toBeVisible();

  await executedFirstStepNode.click();

  await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
    'Create Record',
  );
});

test('Workflow Runs with a pending form step can be opened in the side panel and then in full screen', async ({
  workflowVisualizer,
  page,
}) => {
  await workflowVisualizer.createInitialTrigger('manual');

  const manualTriggerAvailabilitySelect = page.getByRole('button', {
    name: 'When record(s) are selected',
  });

  await manualTriggerAvailabilitySelect.click();

  const alwaysAvailableOption = page.getByText(
    'When no record(s) are selected',
  );

  await alwaysAvailableOption.click();

  await workflowVisualizer.closeSidePanel();

  const { createdStepId: firstStepId } =
    await workflowVisualizer.createStep('form');

  await workflowVisualizer.closeSidePanel();

  const launchTestButton = page.getByLabel(workflowVisualizer.workflowName);

  await launchTestButton.click();

  const goToExecutionPageLink = page.getByRole('link', {
    name: 'View execution details',
  });

  await expect(goToExecutionPageLink).toBeVisible();

  await workflowVisualizer.seeRunsButton.click();

  const workflowRunName = `#1 - ${workflowVisualizer.workflowName}`;

  const workflowRunNameCell = page.getByRole('cell', { name: workflowRunName });

  await expect(workflowRunNameCell).toBeVisible();

  await workflowVisualizer.setWorkflowsOpenInMode('side-panel');

  // 1. Exit the dropdown
  await workflowRunNameCell.click();
  // 2. Actually open the workflow run in the side panel
  await workflowRunNameCell.click();

  await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
    'Form',
  );

  await workflowVisualizer.goBackInCommandMenu.click();

  const workflowRunNameInCommandMenu =
    workflowVisualizer.commandMenu.getByText(workflowRunName);

  await expect(workflowRunNameInCommandMenu).toBeVisible();

  await workflowVisualizer.triggerNode.click();

  await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
    'Launch manually',
  );

  await workflowVisualizer.goBackInCommandMenu.click();

  const formStep = workflowVisualizer.getStepNode(firstStepId);

  await formStep.click();

  await workflowVisualizer.goBackInCommandMenu.click();

  const openInFullScreenButton = workflowVisualizer.commandMenu.getByRole(
    'button',
    { name: 'Open' },
  );

  await openInFullScreenButton.click();

  const workflowRunNameInShowPage = page
    .getByText(`#1 - ${workflowVisualizer.workflowName}`)
    .nth(1);

  await expect(workflowRunNameInShowPage).toBeVisible();

  // Expect the side panel to be opened by default on the form.
  await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
    'Form',
  );
});
