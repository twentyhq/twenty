import { type Page } from '@playwright/test';
import { postBackendGraphQL } from './post-backend-graphql';

export const deleteWorkflow = async ({
  page,
  workflowId,
}: {
  page: Page;
  workflowId: string;
}) => {
  return postBackendGraphQL({
    page,
    data: {
      operationName: 'DeleteCoreWorkflows',
      variables: { input: { coreWorkflowIds: [workflowId] } },
      query:
        'mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {\n  deleteCoreWorkflows(input: $input) {\n    __typename\n    id\n  }\n}',
    },
  });
};
