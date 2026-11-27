import { listConnections } from 'twenty-sdk/logic-function';

import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';

export const listGranolaPersonalConnections = async (
  userWorkspaceId: string,
) => {
  const connections = await listConnections({
    providerName: GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
    scope: 'USER',
    userWorkspaceId,
  });

  return connections.filter(
    (connection) =>
      connection.providerName === GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME &&
      connection.scope === 'USER' &&
      connection.userWorkspaceId === userWorkspaceId,
  );
};
