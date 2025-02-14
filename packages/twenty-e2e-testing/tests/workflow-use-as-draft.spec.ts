import { expect } from '@playwright/test';
import { test } from '../lib/fixtures/blank-workflow';

test('Use an old version as draft', async ({ workflowVisualizer, page }) => {
  await workflowVisualizer.createInitialTrigger('record-created');

  await workflowVisualizer.createStep('create-record');

  await workflowVisualizer.background.click();

  await Promise.all([
    expect(workflowVisualizer.workflowStatus).toHaveText('Active'),

    workflowVisualizer.activateWorkflowButton.click(),
  ]);

  await Promise.all([
    expect(workflowVisualizer.workflowStatus).toHaveText('Draft'),

    workflowVisualizer.createStep('delete-record'),
  ]);

  await workflowVisualizer.background.click();

  await Promise.all([
    expect(workflowVisualizer.workflowStatus).toHaveText('Active'),

    workflowVisualizer.activateWorkflowButton.click(),
  ]);

  await expect(workflowVisualizer.triggerNode).toContainText(
    'Record is Created',
  );
  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Create Record',
    'Delete Record',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(2);
  await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();

  const workflowsLink = page.getByRole('link', { name: 'Workflows' });
  await workflowsLink.click();

  const recordTableRowForWorkflow = page.getByRole('row', {
    name: workflowVisualizer.workflowName,
  });

  const linkToWorkflow = recordTableRowForWorkflow.getByRole('link', {
    name: workflowVisualizer.workflowName,
  });
  expect(linkToWorkflow).toBeVisible();

  const linkToFirstWorkflowVersion = recordTableRowForWorkflow.getByRole(
    'link',
    {
      name: 'v1',
    },
  );

  await linkToFirstWorkflowVersion.click();

  await expect(workflowVisualizer.workflowStatus).toHaveText('Archived');
  await expect(workflowVisualizer.useAsDraftButton).toBeVisible();
  await expect(workflowVisualizer.triggerNode).toContainText(
    'Record is Created',
  );
  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Create Record',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);

  await Promise.all([
    page.waitForURL(`/object/workflow/${workflowVisualizer.workflowId}`),

    workflowVisualizer.useAsDraftButton.click(),
  ]);

  await expect(workflowVisualizer.workflowStatus).toHaveText('Draft');
  await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();
  await expect(workflowVisualizer.triggerNode).toContainText(
    'Record is Created',
  );
  await expect(workflowVisualizer.getAllStepNodes()).toContainText([
    'Create Record',
  ]);
  await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);
});

test.fixme(
  'Use an old version as draft while having a pending draft version',
  async ({ workflowVisualizer, page }) => {
    await workflowVisualizer.createInitialTrigger('record-created');

    await workflowVisualizer.createStep('create-record');

    await workflowVisualizer.background.click();

    await Promise.all([
      expect(workflowVisualizer.workflowStatus).toHaveText('Active'),

      workflowVisualizer.activateWorkflowButton.click(),
    ]);

    await Promise.all([
      expect(workflowVisualizer.workflowStatus).toHaveText('Draft'),

      workflowVisualizer.createStep('delete-record'),
    ]);

    await expect(workflowVisualizer.triggerNode).toContainText(
      'Record is Created',
    );
    await expect(workflowVisualizer.getAllStepNodes()).toContainText([
      'Create Record',
      'Delete Record',
    ]);
    await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(2);
    await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();

    const workflowsLink = page.getByRole('link', { name: 'Workflows' });
    await workflowsLink.click();

    const recordTableRowForWorkflow = page.getByRole('row', {
      name: workflowVisualizer.workflowName,
    });

    const linkToWorkflow = recordTableRowForWorkflow.getByRole('link', {
      name: workflowVisualizer.workflowName,
    });
    expect(linkToWorkflow).toBeVisible();

    const linkToFirstWorkflowVersion = recordTableRowForWorkflow.getByRole(
      'link',
      {
        name: 'v1',
      },
    );

    await linkToFirstWorkflowVersion.click();

    await expect(workflowVisualizer.workflowStatus).toHaveText('Active');
    await expect(workflowVisualizer.useAsDraftButton).toBeVisible();
    await expect(workflowVisualizer.triggerNode).toContainText(
      'Record is Created',
    );
    await expect(workflowVisualizer.getAllStepNodes()).toContainText([
      'Create Record',
    ]);
    await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);

    await Promise.all([
      expect(workflowVisualizer.overrideDraftButton).toBeVisible(),

      workflowVisualizer.useAsDraftButton.click(),
    ]);

    await Promise.all([
      page.waitForURL(`/object/workflow/${workflowVisualizer.workflowId}`),

      workflowVisualizer.overrideDraftButton.click(),
    ]);

    await expect(workflowVisualizer.workflowStatus).toHaveText('Draft');
    await expect(workflowVisualizer.useAsDraftButton).not.toBeVisible();
    await expect(workflowVisualizer.triggerNode).toContainText(
      'Record is Created',
    );
    await expect(workflowVisualizer.getAllStepNodes()).toContainText([
      'Create Record',
    ]);
    await expect(workflowVisualizer.getAllStepNodes()).toHaveCount(1);
    await expect(workflowVisualizer.activateWorkflowButton).toBeVisible();
    await expect(workflowVisualizer.discardDraftButton).toBeVisible();
  },
);
