import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const LIST_APP_CONNECTIONS_QUERY = `
  query ListAppConnections($filter: ListAppConnectionsInput) {
    appConnections(filter: $filter) {
      id
      providerName
      name
      handle
      visibility
      userWorkspaceId
      accessToken
      scopes
      authFailedAt
    }
  }
`;

export type ListConnectionsFilter = {
  providerName?: string;
  userWorkspaceId?: string;
  visibility?: 'user' | 'workspace';
};

export const listConnections = async (
  filter: ListConnectionsFilter = {},
): Promise<AppConnection[]> => {
  const { appConnections } = await postGraphqlRequest<
    { filter: ListConnectionsFilter },
    { appConnections: AppConnection[] }
  >({
    query: LIST_APP_CONNECTIONS_QUERY,
    variables: { filter },
    caller: 'listConnections',
  });

  return appConnections;
};
