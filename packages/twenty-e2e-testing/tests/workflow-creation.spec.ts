import { expect, test } from '../lib/fixtures/screenshot';
import { deleteCoreWorkflows } from '../lib/requests/delete-core-workflows';

test('Create workflow', async ({ page }) => {
  await page.goto(process.env.LINK);

  const workflowsFolder = page.getByRole('button', { name: 'Workflows' });
  await workflowsFolder.click();

  const workflowsLink = page.getByRole('link', { name: 'Workflows' });
  await workflowsLink.click();

  const [createWorkflowResponse] = await Promise.all([
    page.waitForResponse(async (response) => {
      if (!response.url().endsWith('/graphql')) {
        return false;
      }

      const requestBody = response.request().postDataJSON();

      return requestBody.operationName === 'CreateCoreWorkflow';
    }),

    page.getByText('New Workflow').click(),
  ]);

  const body = await createWorkflowResponse.json();
  expect(body.errors).toBeUndefined();
  const newCoreWorkflowId = body.data.createCoreWorkflow.id;

  try {
    await expect(page).toHaveURL(`/workflow/${newCoreWorkflowId}`);
  } finally {
    await deleteCoreWorkflows({
      page,
      coreWorkflowIds: [newCoreWorkflowId],
    });
  }
});
