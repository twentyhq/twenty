import { expect, test } from '../lib/fixtures/screenshot';
import { deleteWorkflow } from '../lib/requests/delete-workflow';
import { destroyWorkflow } from '../lib/requests/destroy-workflow';

test('Create workflow', async ({ page }) => {
  const NEW_WORKFLOW_NAME = 'Test Workflow';

  await page.goto(process.env.LINK);

  const workflowsFolder = page.getByRole('button', { name: 'Workflows' });
  await workflowsFolder.click();

  const workflowsLink = page.getByRole('link', { name: 'Workflows' });
  await workflowsLink.click();

  const createWorkflowButton = page.getByRole('button', {
    name: 'Create Workflow',
  });

  await createWorkflowButton.click();
  await page
    .getByRole('complementary')
    .getByRole('textbox')
    .fill(NEW_WORKFLOW_NAME);

  const [createWorkflowResponse] = await Promise.all([
    page.waitForResponse(async (response) => {
      if (!response.url().endsWith('/graphql')) {
        return false;
      }

      const requestBody = response.request().postDataJSON();

      return requestBody.operationName === 'CreateOneWorkflow';
    }),

    page.getByTestId('record-creation-form-create-button').click(),
  ]);

  const body = await createWorkflowResponse.json();
  expect(body.errors).toBeUndefined();
  const newWorkflowId = body.data.createWorkflow.id;

  try {
    const workflowName = page
      .getByTestId('top-bar-title')
      .getByText(NEW_WORKFLOW_NAME);

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
