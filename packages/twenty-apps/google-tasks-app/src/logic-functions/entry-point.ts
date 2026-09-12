import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';
import { executeWithRetry } from 'src/logic-functions/utils/execute-with-retry.util';
import { ENTRY_POINT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from "src/constants/universal-identifiers";
import { GOOGLE_TASKS_CONNECTION_PROVIDER_NAME, } from "src/constants/sync";
import { RestApiClient } from 'twenty-client-sdk/rest';

const handler = async () => {
  const connections = await executeWithRetry(() =>
    listConnections({
      providerName: GOOGLE_TASKS_CONNECTION_PROVIDER_NAME,
      visibility: 'user',
    }),
  );

  const payloads = connections
  .filter(
    (connection) =>
      connection.authFailedAt === null,
  );

  if (payloads.length === 0) {
    return;
  }
  const client = new RestApiClient();

  for (const connection of payloads) {
    await client.post('/s/sync-google-tasks', { connectionId: connection.id });
  }
};

export default defineLogicFunction({
  universalIdentifier: ENTRY_POINT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'entry-point',
  description: 'Enqueues one independent sync-tasks run per user connection',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/15 * * * *',
  },
});
