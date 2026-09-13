import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { SYNC_CONTACTS_SCHEDULER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SYNC_CONTACTS_ROUTE_PATH } from 'src/constants/route-paths';

const DISPATCH_TIMEOUT_MILLISECONDS = 2_000;

const isDispatchTimeout = (error: unknown): boolean =>
  error instanceof Error && error.name === 'TimeoutError';

const dispatchSync = async (
  client: RestApiClient,
  connectionId: string,
): Promise<void> => {
  try {
    await client.post(
      `/s${SYNC_CONTACTS_ROUTE_PATH}`,
      { connectionId },
      { signal: AbortSignal.timeout(DISPATCH_TIMEOUT_MILLISECONDS) },
    );
  } catch (error) {
    if (isDispatchTimeout(error)) {
      return;
    }

    console.error(
      '[google-contacts] Failed to dispatch sync',
      connectionId,
      error,
    );
  }
};

const handler = async () => {
  const connections = await listConnections({
    providerName: 'google-contacts',
    visibility: 'user',
  });

  const connectionsToSync = connections.filter(
    (connection) => !isDefined(connection.authFailedAt),
  );

  if (connectionsToSync.length === 0) {
    return;
  }
  const client = new RestApiClient();

  await Promise.all(
    connectionsToSync.map((connection) => dispatchSync(client, connection.id)),
  );
};

export default defineLogicFunction({
  universalIdentifier:
  SYNC_CONTACTS_SCHEDULER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-contacts-scheduler',
  description:
    'Enqueues one Google contacts sync job per connected user every 30 minutes.',
  timeoutSeconds: 900,
  handler,
  cronTriggerSettings: {
    pattern: '*/30 * * * *',
  },
});
