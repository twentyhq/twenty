// import { expect } from '@playwright/test';
// import { test } from '../lib/fixtures/blank-workflow';

// test('The workflow run visualizer shows the executed draft version without the last draft changes', async ({
//   workflowVisualizer,
//   page,
// }) => {
//   await workflowVisualizer.createInitialTrigger('manual');

//   const manualTriggerAvailabilitySelect = page.getByRole('button', {
//     name: 'When record is selected',
//   });

//   await manualTriggerAvailabilitySelect.click();

//   const alwaysAvailableOption = page.getByText('When no record is selected');

//   await alwaysAvailableOption.click();

//   await workflowVisualizer.closeSidePanel();

//   const { createdStepId: firstStepId } =
//     await workflowVisualizer.createStep('create-record');

//   await workflowVisualizer.closeSidePanel();

//   const launchTestButton = page.getByLabel(workflowVisualizer.workflowName);

//   await launchTestButton.click();

//   await workflowVisualizer.closeSidePanel();

//   await workflowVisualizer.deleteStep(firstStepId);

//   await page.goto('/objects/workflowRuns');

//   const recordTableRowForWorkflowRun = page
//     .getByRole('row', {
//       name: workflowVisualizer.workflowName,
//     })
//     .first();

//   const linkToWorkflowRun = recordTableRowForWorkflowRun
//     .getByRole('link', {
//       name: workflowVisualizer.workflowName,
//     })
//     .first();

//   await linkToWorkflowRun.click({ force: true });

//   const workflowRunNameElement = page
//     .getByText(`#1 - ${workflowVisualizer.workflowName}`)
//     .nth(1);

//   await expect(workflowRunNameElement).toBeVisible();

//   const executedFirstStepNode = workflowVisualizer.getStepNode(firstStepId);

//   await expect(executedFirstStepNode).toBeVisible();

//   await executedFirstStepNode.click();

//   await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
//     'Create Record',
//   );
// });

// test('Workflow Runs with a pending form step can be opened in the side panel and then in full screen', async ({
//   workflowVisualizer,
//   page,
// }) => {
//   await workflowVisualizer.createInitialTrigger('manual');

//   const manualTriggerAvailabilitySelect = page.getByRole('button', {
//     name: 'When record is selected',
//   });

//   await manualTriggerAvailabilitySelect.click();

//   const alwaysAvailableOption = page.getByText('When no record is selected');

//   await alwaysAvailableOption.click();

//   await workflowVisualizer.closeSidePanel();

//   const { createdStepId: firstStepId } =
//     await workflowVisualizer.createStep('form');

//   const addFormFieldButton = page.getByText('Add Field', { exact: true });

//   await addFormFieldButton.click();

//   await workflowVisualizer.closeSidePanel();

//   const launchTestButton = page.getByLabel(workflowVisualizer.workflowName);

//   await launchTestButton.click();

//   const workflowRunName = `#1 - ${workflowVisualizer.workflowName}`;

//   await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
//     'Form',
//     {
//       timeout: 30_000,
//     },
//   );

//   await workflowVisualizer.goBackInCommandMenu.click();

//   const workflowRunNameInCommandMenu =
//     workflowVisualizer.commandMenu.getByText(workflowRunName);

//   await expect(workflowRunNameInCommandMenu).toBeVisible();

//   await workflowVisualizer.commandMenu
//     .locator(workflowVisualizer.triggerNode)
//     .click();

//   await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
//     'Launch manually',
//   );

//   await workflowVisualizer.goBackInCommandMenu.click();

//   const formStep = workflowVisualizer.commandMenu.locator(
//     workflowVisualizer.getStepNode(firstStepId),
//   );

//   await formStep.click();

//   await workflowVisualizer.goBackInCommandMenu.click();

//   const openInFullScreenButton = workflowVisualizer.commandMenu.getByRole(
//     'button',
//     { name: 'Open' },
//   );

//   await openInFullScreenButton.click();

//   const workflowRunNameInShowPage = page
//     .getByText(`#1 - ${workflowVisualizer.workflowName}`)
//     .nth(1);

//   await expect(workflowRunNameInShowPage).toBeVisible();

//   // Expect the side panel to be opened by default on the form.
//   await expect(workflowVisualizer.stepHeaderInCommandMenu).toContainText(
//     'Form',
//   );
// });
