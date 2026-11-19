import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { GRANOLA_HISTORY_SCHEDULE_KEY } from 'src/constants/granola.constant';
import { GRANOLA_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { cleanupPendingGranolaRegistrationOrThrow } from 'src/logic-functions/utils/cleanup-pending-granola-registration-or-throw.util';
import { createWorkspaceGranolaClientOrThrow } from 'src/logic-functions/utils/create-workspace-granola-client-or-throw.util';
import { disconnectGranolaPersonalConnection } from 'src/logic-functions/utils/disconnect-granola-personal-connection.util';
import { isGranolaApiKeySet } from 'src/logic-functions/utils/is-granola-api-key-set.util';
import { listGranolaPersonalConnections } from 'src/logic-functions/utils/list-granola-personal-connections.util';
import { removeGranolaWebhookRegistration } from 'src/logic-functions/utils/remove-granola-webhook-registration.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const granolaUninstallHandler = async () => {
  const client = isGranolaApiKeySet()
    ? createWorkspaceGranolaClientOrThrow()
    : undefined;

  if (isDefined(client)) {
    try {
      const { webhook_endpoints: endpoints } =
        await client.listWebhookEndpoints();
      await cleanupPendingGranolaRegistrationOrThrow({
        client,
        endpoints,
        apiUrl: process.env.TWENTY_API_URL,
      });
    } catch (error) {
      console.error(
        `[granola] Could not clean up the pending registration during uninstall; check Granola webhook settings. ${toErrorMessage(error)}`,
      );
    }
  }

  await kv.delete(GRANOLA_HISTORY_SCHEDULE_KEY);

  const result = await removeGranolaWebhookRegistration({ client });
  const connections = await listGranolaPersonalConnections().catch(
    (error: unknown) => {
      console.error(
        `[granola] Could not list personal connections during uninstall. ${toErrorMessage(error)}`,
      );

      return [];
    },
  );

  await Promise.all(
    connections.map(async (connection) => {
      try {
        await disconnectGranolaPersonalConnection({
          connectionId: connection.id,
          apiKey: connection.accessToken,
        });
      } catch (error) {
        console.error(
          `[granola] Could not clean up personal connection ${connection.id}. ${toErrorMessage(error)}`,
        );
      }
    }),
  );

  return result;
};

export default defineUninstallLogicFunction({
  universalIdentifier: GRANOLA_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'granola-uninstall',
  description: 'Removes the registered Granola webhook on uninstall.',
  timeoutSeconds: 30,
  handler: granolaUninstallHandler,
});
