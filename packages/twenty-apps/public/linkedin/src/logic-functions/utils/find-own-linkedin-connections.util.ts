import { isNonEmptyString } from '@sniptt/guards';
import {
  type AppConnection,
  listConnections,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_PROVIDER_NAME } from 'src/constants/linkedin-provider-name.constant';

type OwnLinkedinConnections = {
  connections: AppConnection[];
  requestedConnection: AppConnection | undefined;
};

export const findOwnLinkedinConnections = async ({
  context,
  requestBody,
}: {
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>;
  requestBody?: Record<string, unknown> | null;
}): Promise<OwnLinkedinConnections> => {
  if (!isDefined(context.userWorkspaceId)) {
    return { connections: [], requestedConnection: undefined };
  }

  const connections = (
    await listConnections({ providerName: LINKEDIN_PROVIDER_NAME })
  )
    .filter(
      (connection) => connection.userWorkspaceId === context.userWorkspaceId,
    )
    .sort(
      (first, second) =>
        first.name.localeCompare(second.name) ||
        first.id.localeCompare(second.id),
    );

  const requestedConnectionId = requestBody?.connectedAccountId;

  return {
    connections,
    requestedConnection: isNonEmptyString(requestedConnectionId)
      ? connections.find(({ id }) => id === requestedConnectionId)
      : connections[0],
  };
};
