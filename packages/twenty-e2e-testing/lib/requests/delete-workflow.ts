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
      operationName: 'DeleteOneWorkflow',
      variables: { idToDelete: workflowId },
      query:
        'mutation DeleteOneWorkflow($idToDelete: UUID!) {\n  deleteWorkflow(id: $idToDelete) {\n    __typename\n    deletedAt\n    id\n  }\n}',
    },
  });
};
