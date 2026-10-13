import { type Page } from '@playwright/test';
import { postBackendGraphQL } from './post-backend-graphql';

export const createCoreWorkflow = async ({
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
        'mutation CreateCoreWorkflow($input: CreateCoreWorkflowInput!) {\n  createCoreWorkflow(input: $input) {\n    id\n  }\n}',
      variables: {
        input: {
          name: workflowName,
        },
      },
    },
  });
};
