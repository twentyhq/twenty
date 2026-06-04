import { AppConnectionAuthFailedError } from '@/sdk/logic-function/connections/errors/app-connection-auth-failed.error';
import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import { postAppEndpoint } from '@/sdk/logic-function/utils/post-app-endpoint.util';

// Look up a single connection by id. The id is stable across reconnects
// (the row keeps its id when the user clicks "Reconnect"), so apps can
// safely persist it in their own data and call this helper on each
// invocation to retrieve a fresh access token.
//
// Throws `AppConnectionAuthFailedError` if the credential is in a
// permanent-failure state (the user must reconnect from the app's
// settings tab). Throws a regular `Error` for any other failure
// (network, not-found, transient refresh failure).
export const getConnection = async (id: string): Promise<AppConnection> => {
  const connection = await postAppEndpoint<{ id: string }, AppConnection>({
    path: 'connections/get',
    body: { id },
    caller: 'getConnection',
  });

  if (connection.authFailedAt !== null) {
    throw new AppConnectionAuthFailedError(connection.id);
  }

  return connection;
};
