import { type Page } from '@playwright/test';
import { postBackendGraphQL } from './post-backend-graphql';

export const createWorkflow = async ({
  page,
  workflowName,
}: {
  page: Page;
  workflowName: string;
}) => {
  return postBackendGraphQL<{ createCoreWorkflow: { id: string } }>({
    page,
    data: {
      operationName: 'CreateCoreWorkflow',
      query:
        'mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {  createCoreWorkflow(input: $input) { __typename id } }',
      variables: {
        input: {
          name: workflowName,
        },
      },
    },
  });
};
