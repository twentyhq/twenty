import { listConnections } from 'twenty-sdk/logic-function';

import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';
import { disconnectGranolaPersonalConnection } from 'src/logic-functions/utils/disconnect-granola-personal-connection.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const disconnectAllGranolaPersonalConnections = async () => {
  const connections = await listConnections({
    providerName: GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
    scope: 'USER',
  });

  await Promise.all(
    connections.map(({ id: connectionId, accessToken }) =>
      disconnectGranolaPersonalConnection({
        connectionId,
        apiKey: accessToken,
      }).catch((error: unknown) => {
        console.error(
          `[granola] Could not remove the personal webhook of connection ${connectionId} during uninstall; check Granola webhook settings. ${toErrorMessage(error)}`,
        );
      }),
    ),
  );
};
