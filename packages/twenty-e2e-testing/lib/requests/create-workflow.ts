import { Page } from '@playwright/test';
import { getAuthToken } from '../utils/getAuthToken';
import { backendGraphQLUrl } from './backend';

export const createWorkflow = async ({
  page,
  workflowId,
  workflowName,
}: {
  page: Page;
  workflowId: string;
  workflowName: string;
}) => {
  const { authToken } = await getAuthToken(page);

  return page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'CreateOneWorkflow',
      query:
        'mutation CreateOneWorkflow($input: WorkflowCreateInput!) {  createWorkflow(data: $input) { __typename id } }',
      variables: {
        input: {
          id: workflowId,
          name: workflowName,
        },
      },
    },
  });
};
