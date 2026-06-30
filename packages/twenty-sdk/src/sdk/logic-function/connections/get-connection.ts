import { AppConnectionAuthFailedError } from '@/sdk/logic-function/connections/errors/app-connection-auth-failed.error';
import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const GET_APP_CONNECTION_QUERY = `
  query GetAppConnection($id: ID!) {
    appConnection(id: $id) {
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

export const getConnection = async (id: string): Promise<AppConnection> => {
  const { appConnection } = await postGraphqlRequest<
    { id: string },
    { appConnection: AppConnection }
  >({
    query: GET_APP_CONNECTION_QUERY,
    variables: { id },
    caller: 'getConnection',
  });

  if (appConnection.authFailedAt !== null) {
    throw new AppConnectionAuthFailedError(appConnection.id);
  }

  return appConnection;
};
