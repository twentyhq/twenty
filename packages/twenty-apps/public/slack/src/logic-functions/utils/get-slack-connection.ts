import { listConnections } from 'twenty-sdk/logic-function';

import { getConnectionAccessTokenOrThrow } from 'src/logic-functions/utils/get-connection-access-token-or-throw';

export const getSlackConnection = async (): Promise<
  | { success: true; accessToken: string; connectionId: string }
  | { success: false; error: string }
> => {
  try {
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

    return {
      success: true,
      accessToken: getConnectionAccessTokenOrThrow(connection),
      connectionId: connection.id,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load Slack connection.';

    return { success: false, error: message };
  }
};
