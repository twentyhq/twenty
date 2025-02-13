import { expect, test } from '@playwright/test';
import { deleteWorkflow } from '../lib/requests/delete-workflow';
import { destroyWorkflow } from '../lib/requests/destroy-workflow';

test('Create workflow', async ({ page }) => {
  const NEW_WORKFLOW_NAME = 'Test Workflow';

  await page.goto('/');

  const workflowsLink = page.getByRole('link', { name: 'Workflows' });
  await workflowsLink.click();

  const createWorkflowButton = page.getByRole('button', { name: 'New record' });

  const [createWorkflowResponse] = await Promise.all([
    page.waitForResponse(async (response) => {
      if (!response.url().endsWith('/graphql')) {
        return false;
      }

      const requestBody = response.request().postDataJSON();

      return requestBody.operationName === 'CreateOneWorkflow';
    }),

    await createWorkflowButton.click(),
  ]);

  const nameInput = page.getByRole('textbox');
  await nameInput.fill(NEW_WORKFLOW_NAME);

  const workflowDiagramContainer = page.locator('.react-flow__renderer');
  await workflowDiagramContainer.click();

  const body = await createWorkflowResponse.json();
  const newWorkflowId = body.data.createWorkflow.id;

  try {
    const workflowName = page.getByRole('button', { name: NEW_WORKFLOW_NAME });

    await expect(workflowName).toBeVisible();

    await expect(page).toHaveURL(`/object/workflow/${newWorkflowId}`);
  } finally {
    await deleteWorkflow({
      page,
      workflowId: newWorkflowId,
    });
    await destroyWorkflow({
      page,
      workflowId: newWorkflowId,
    });
  }
});
