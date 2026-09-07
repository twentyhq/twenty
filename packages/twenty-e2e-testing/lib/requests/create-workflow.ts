import { type Page } from '@playwright/test';
import { postBackendGraphQL } from './post-backend-graphql';

export const createWorkflow = async ({
  page,
  workflowId,
  workflowName,
}: {
  page: Page;
  workflowId: string;
  workflowName: string;
}) => {
  return postBackendGraphQL({
    page,
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
