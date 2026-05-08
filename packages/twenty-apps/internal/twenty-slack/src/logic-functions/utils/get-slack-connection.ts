import { listConnections } from 'twenty-sdk/logic-function';

export const getSlackConnection = async (): Promise<
  { success: true; accessToken: string } | { success: false; error: string }
> => {
  const connections = await listConnections({ providerName: 'slack' });
  const connection =
    connections.find((item) => item.visibility === 'workspace') ??
    connections[0];

  if (!connection) {
    return {
      success: false,
      error:
        'Slack is not connected. Open the Slack app settings and click "Add connection" first.',
    };
  }

  return { success: true, accessToken: connection.accessToken };
};
