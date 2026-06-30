import { type Page } from '@playwright/test';
import { getAccessAuthToken } from '../utils/getAccessAuthToken';
import { backendGraphQLUrl } from './backend';

export const deleteWorkflow = async ({
  page,
  workflowId,
}: {
  page: Page;
  workflowId: string;
}) => {
  const { authToken } = await getAccessAuthToken(page);

  return page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'DeleteOneWorkflow',
      variables: { idToDelete: workflowId },
      query:
        'mutation DeleteOneWorkflow($idToDelete: UUID!) {\n  deleteWorkflow(id: $idToDelete) {\n    __typename\n    deletedAt\n    id\n  }\n}',
    },
  });
};
