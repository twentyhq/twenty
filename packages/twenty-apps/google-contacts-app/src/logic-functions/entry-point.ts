import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from "twenty-sdk/logic-function";
import { RestApiClient } from "twenty-client-sdk/rest";

const handler = async () => {
  const connections = await listConnections({ providerName: 'google-contacts', visibility: "user" });

  if (connections.length === 0) {
    return {
      success: false,
      error: 'Missing user connection',
    }
  }
  const baseUrl = process.env["TWENTY_FUNCTIONS_URL"];
  if (baseUrl === undefined) {
    return {
      success: false,
      error: 'Can\'t resolve base URL',
    }
  }
  const client = new RestApiClient({baseUrl});

  for (const connection of connections) {
    await client.post('/s/sync-contacts', { connectionId: connection.id });
  }
};

export default defineLogicFunction({
  universalIdentifier: '8707786f-b1b1-4cf8-a614-63f498460c6d',
  name: 'sync-contacts',
  description: 'Add a description for your logic function',
  timeoutSeconds: 900,
  handler,
  cronTriggerSettings: {
    pattern: '*/30 * * * *',
  },
});
