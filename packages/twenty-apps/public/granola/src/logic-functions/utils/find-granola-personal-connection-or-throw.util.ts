import { isNonEmptyString } from '@sniptt/guards';
import {
  AppConnectionAuthFailedError,
  getConnection,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';
import { listGranolaPersonalConnections } from 'src/logic-functions/utils/list-granola-personal-connections.util';

export const findGranolaPersonalConnectionOrThrow = async ({
  connectionId,
  userWorkspaceId,
}: {
  connectionId: string;
  userWorkspaceId?: string;
}) => {
  const getRequestedConnectionOrThrow = async () => {
    if (isDefined(userWorkspaceId)) {
      const connections = await listGranolaPersonalConnections(userWorkspaceId);

      return connections.find(({ id }) => id === connectionId);
    }

    return getConnection(connectionId);
  };
  const connection = await getRequestedConnectionOrThrow().catch(
    (error: unknown) => {
      if (error instanceof AppConnectionAuthFailedError) {
        return undefined;
      }

      throw error;
    },
  );

  if (
    !isDefined(connection) ||
    connection.providerName !== GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME ||
    connection.scope !== 'USER' ||
    !isDefined(connection.workspaceMemberId) ||
    isDefined(connection.authFailedAt) ||
    !isNonEmptyString(connection.accessToken)
  ) {
    return undefined;
  }

  return { ...connection, accessToken: connection.accessToken };
};
