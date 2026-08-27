import {
  findConnectionForRequest,
  listConnections,
  type AppConnection,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { FATHOM_PROVIDER_NAME } from 'src/constants/fathom.constant';

export const getFathomConnectionForRequest = async (
  context: LogicFunctionExecutionContext,
): Promise<AppConnection> => {
  const connections = await listConnections({
    providerName: FATHOM_PROVIDER_NAME,
  });
  const connection = findConnectionForRequest(connections, {
    userWorkspaceId: context.userWorkspaceId,
  });

  if (!connection) {
    throw new Error(
      'Fathom is not connected for this user. Open the Fathom app settings and add a connection.',
    );
  }

  return connection;
};
