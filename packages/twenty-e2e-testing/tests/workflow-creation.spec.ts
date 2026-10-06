import { expect, test } from '../lib/fixtures/screenshot';
import { deleteWorkflow } from '../lib/requests/delete-workflow';

test('Create workflow', async ({ page }) => {
  await page.goto(process.env.LINK);

  const workflowsFolder = page.getByRole('button', { name: 'Workflows' });
  await workflowsFolder.click();

  const workflowsLink = page.getByRole('link', { name: 'Workflows' });
  await workflowsLink.click();

  await expect(page).toHaveURL('/workflows');

  const [createWorkflowResponse] = await Promise.all([
    page.waitForResponse(async (response) => {
      if (!response.url().endsWith('/graphql')) {
        return false;
      }

      const requestBody = response.request().postDataJSON();

      return requestBody.operationName === 'CreateCoreWorkflow';
    }),

    page.getByRole('button', { name: 'Create Workflow' }).click(),
  ]);

  const body = await createWorkflowResponse.json();
  expect(body.errors).toBeUndefined();
  const newWorkflowId = body.data.createCoreWorkflow.id;

  try {
    await expect(page).toHaveURL(`/workflow/${newWorkflowId}`);
  } finally {
    await deleteWorkflow({
      page,
      workflowId: newWorkflowId,
    });
  }
});
