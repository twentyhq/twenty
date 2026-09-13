import { defineLogicFunction } from 'twenty-sdk/define';
import { enqueueJobs, listConnections } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  SYNC_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SYNC_CONTACTS_SCHEDULER_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

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

  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      SYNC_CONTACTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    jobs: connectionsToSync.map((connection) => ({
      payload: { connectionId: connection.id },
    })),
  });
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
