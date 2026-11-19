import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { listGranolaPersonalConnections } from 'src/logic-functions/utils/list-granola-personal-connections.util';

export const findGranolaPersonalConnection = async ({
  connectionId,
  userWorkspaceId,
}: {
  connectionId: string;
  userWorkspaceId: string;
}) => {
  const connections = await listGranolaPersonalConnections(userWorkspaceId);
  const connection = connections.find(({ id }) => id === connectionId);

  if (
    !isDefined(connection) ||
    !isDefined(connection.workspaceMemberId) ||
    isDefined(connection.authFailedAt) ||
    !isNonEmptyString(connection.accessToken)
  ) {
    return undefined;
  }

  return { ...connection, accessToken: connection.accessToken };
};
