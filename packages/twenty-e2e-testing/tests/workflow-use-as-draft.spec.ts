
// test('Use an old version as draft', async ({ workflowVisualizer, page }) => {
//   await workflowVisualizer.createInitialTrigger('record-created');

//   await workflowVisualizer.createStep('create-record');

//   await workflowVisualizer.background.click();

//   await workflowVisualizer.activateWorkflowButton.click();

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Active');

//   await workflowVisualizer.createStep('delete-record');

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Draft');

//   await workflowVisualizer.closeSidePanel();

//   await workflowVisualizer.activateWorkflowButton.click();

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Active');

//   await expect(workflowVisualizer.triggerNode).toContainText(
//     'Record is created',
//   );
//   await expect(workflowVisualizer.getAllStepNodes()).toContainText([
//     'Create Record',
//     'Delete Record',
//   ]);
//   await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(2);
//   await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();

//   const workflowsLink = page.getByRole('link', { name: 'Workflows' });
//   await workflowsLink.click();

//   await workflowVisualizer.setWorkflowsOpenInMode('record-page');

//   const recordTableRowForWorkflow = page.getByRole('row', {
//     name: workflowVisualizer.workflowName,
//   });

//   const linkToWorkflow = recordTableRowForWorkflow.getByRole('link', {
//     name: workflowVisualizer.workflowName,
//   });
//   await expect(linkToWorkflow).toBeVisible();

//   const linkToFirstWorkflowVersion = recordTableRowForWorkflow.getByRole(
//     'link',
//     {
//       name: 'v1',
//     },
//   );

//   await linkToFirstWorkflowVersion.click({ force: true });

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Archived');
//   await expect(workflowVisualizer.useAsDraftButton).toBeVisible();
//   await expect(workflowVisualizer.triggerNode).toContainText(
//     'Record is created',
//   );
//   await expect(workflowVisualizer.getAllStepNodes()).toContainText([
//     'Create Record',
//   ]);
//   await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);

//   await workflowVisualizer.useAsDraftButton.click();

//   await page.waitForURL(`/object/workflow/${workflowVisualizer.workflowId}`);

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Draft');
//   await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();
//   await expect(workflowVisualizer.triggerNode).toContainText(
//     'Record is created',
//   );
//   await expect(workflowVisualizer.getAllStepNodes()).toContainText([
//     'Create Record',
//   ]);
//   await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);
// });

// test('Use an old version as draft while having a pending draft version', async ({
//   workflowVisualizer,
//   page,
// }) => {
//   await workflowVisualizer.createInitialTrigger('record-created');

//   await workflowVisualizer.createStep('create-record');

//   await workflowVisualizer.background.click();

//   await workflowVisualizer.activateWorkflowButton.click();

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Active');

//   await workflowVisualizer.createStep('delete-record');

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Draft');

//   await expect(workflowVisualizer.triggerNode).toContainText(
//     'Record is created',
//   );
//   await expect(workflowVisualizer.getAllStepNodes()).toContainText([
//     'Create Record',
//     'Delete Record',
//   ]);
//   await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(2);
//   await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();

//   await workflowVisualizer.closeSidePanel();

//   const workflowsLink = page.getByRole('link', { name: 'Workflows' });
//   await workflowsLink.click();

//   const recordTableRowForWorkflow = page.getByRole('row', {
//     name: workflowVisualizer.workflowName,
//   });

//   const linkToWorkflow = recordTableRowForWorkflow.getByRole('link', {
//     name: workflowVisualizer.workflowName,
//   });
//   await expect(linkToWorkflow).toBeVisible();

//   const linkToFirstWorkflowVersion = recordTableRowForWorkflow.getByRole(
//     'link',
//     {
//       name: 'v1',
//     },
//   );

//   await linkToFirstWorkflowVersion.click({ force: true });

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Active');
//   await expect(workflowVisualizer.useAsDraftButton).toBeVisible();
//   await expect(workflowVisualizer.triggerNode).toContainText(
//     'Record is created',
//   );
//   await expect(workflowVisualizer.getAllStepNodes()).toContainText([
//     'Create Record',
//   ]);
//   await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);

//   await workflowVisualizer.useAsDraftButton.click();

//   await expect(workflowVisualizer.overrideDraftButton).toBeVisible();

//   await workflowVisualizer.overrideDraftButton.click();

//   await page.waitForURL(`/object/workflow/${workflowVisualizer.workflowId}`);

//   await expect(workflowVisualizer.workflowStatus).toHaveText('Draft');
//   await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();
//   await expect(workflowVisualizer.triggerNode).toContainText(
//     'Record is created',
//   );
//   await expect(workflowVisualizer.getAllStepNodes()).toContainText([
//     'Create Record',
//   ]);
//   await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);
//   await expect(workflowVisualizer.activateWorkflowButton).toBeVisible();
//   await expect(workflowVisualizer.discardDraftButton).toBeVisible();
// });
