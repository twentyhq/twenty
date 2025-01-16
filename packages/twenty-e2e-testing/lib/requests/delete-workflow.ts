import { Page } from '@playwright/test';
import { getAuthToken } from '../utils/getAuthToken';

export const deleteWorkflow = async (page: Page, workflowId: string) => {
  const { authToken } = await getAuthToken(page)

  return page.request.post(
    new URL('/graphql', process.env.BACKEND_BASE_URL).toString(),
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        operationName: 'DeleteOneWorkflow',
        variables: { idToDelete: workflowId },
        query:
          'mutation DeleteOneWorkflow($idToDelete: ID!) {\n  deleteWorkflow(id: $idToDelete) {\n    __typename\n    deletedAt\n    id\n  }\n}',
      },
    },
  );
};
