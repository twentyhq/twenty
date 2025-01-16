import { expect, test } from '@playwright/test';

test('Create workflow', async ({ page }) => {
  const NEW_WORKFLOW_NAME = 'Test Workflow';

  await page.goto('/');

  const workflowsLink = page.getByRole('link', { name: 'Workflows' });
  await workflowsLink.click();

  const createWorkflowButton = page.getByTestId('add-button');
  await createWorkflowButton.click();

  const nameInput = page.getByPlaceholder('Name');

  await nameInput.fill(NEW_WORKFLOW_NAME);

  const [createWorkflowResponse] = await Promise.all([
    page.waitForResponse(async (response) => {
      if (!response.url().endsWith('/graphql')) {
        return false;
      }

      const requestBody = response.request().postDataJSON();

      return requestBody.operationName === 'CreateOneWorkflow';
    }),

    await nameInput.press('Enter'),
  ]);

  const body = await createWorkflowResponse.json();
  const newWorkflowId = body.data.createWorkflow.id;

  const newWorkflowRowEntryName = page
    .getByTestId(`row-id-${newWorkflowId}`)
    .locator('div')
    .filter({ hasText: NEW_WORKFLOW_NAME })
    .nth(2);

  await Promise.all([
    page.waitForURL(
      (url) => url.pathname === `/object/workflow/${newWorkflowId}`,
    ),

    newWorkflowRowEntryName.click(),
  ]);

  const workflowName = page.getByRole('button', { name: NEW_WORKFLOW_NAME });

  await expect(workflowName).toBeVisible();
});
