import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { GRANOLA_PERSONAL_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { disconnectGranolaPersonalConnection } from 'src/logic-functions/utils/disconnect-granola-personal-connection.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const granolaPersonalDisconnectHandler = async ({
  connectedAccountId: connectionId,
}: {
  connectedAccountId: string;
}) => {
  const connection = await getConnection(connectionId).catch(
    (error: unknown) => {
      console.error(
        `[granola] Could not read the disconnecting connection ${connectionId}. ${toErrorMessage(error)}`,
      );

      return undefined;
    },
  );

  await disconnectGranolaPersonalConnection({
    connectionId,
    apiKey: connection?.accessToken,
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: GRANOLA_PERSONAL_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'granola-personal-disconnect',
  description: 'Stops personal Granola sync when a member disconnects.',
  timeoutSeconds: 30,
  handler: granolaPersonalDisconnectHandler,
});
