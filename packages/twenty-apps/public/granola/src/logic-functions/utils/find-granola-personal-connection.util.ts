import { isDefined } from 'twenty-sdk/utils';

import { isActiveGranolaPersonalConnection } from 'src/logic-functions/utils/is-active-granola-personal-connection.util';
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
    !isActiveGranolaPersonalConnection(connection)
  ) {
    return undefined;
  }

  return connection;
};
