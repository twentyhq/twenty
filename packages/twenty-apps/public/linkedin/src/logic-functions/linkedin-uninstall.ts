import { defineUninstallLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import { LINKEDIN_PROVIDER_NAME } from 'src/constants/linkedin-provider-name.constant';
import { LINKEDIN_UNINSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { removeLinkedinConnectionResources } from 'src/logic-functions/utils/remove-linkedin-connection-resources.util';

export const linkedinUninstallHandler = async (): Promise<{
  removedConnectionCount: number;
  failedConnectionIds: string[];
}> => {
  const connections = await listConnections({
    providerName: LINKEDIN_PROVIDER_NAME,
  });
  const failedConnectionIds: string[] = [];

  for (const connection of connections) {
    try {
      await removeLinkedinConnectionResources({
        connectedAccountId: connection.id,
        unipileAccountId: connection.externalAccountId,
      });
    } catch (error) {
      console.error(
        `[linkedin] cleanup failed for connection ${connection.id} (Unipile account ${connection.externalAccountId}): ${error instanceof Error ? error.message : String(error)}`,
      );
      failedConnectionIds.push(connection.id);
    }
  }

  return {
    removedConnectionCount: connections.length - failedConnectionIds.length,
    failedConnectionIds,
  };
};

export default defineUninstallLogicFunction({
  universalIdentifier: LINKEDIN_UNINSTALL_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-uninstall',
  description:
    'Removes the message channel, Unipile account and webhook routing of every LinkedIn connection when the app is uninstalled.',
  timeoutSeconds: 60,
  handler: linkedinUninstallHandler,
});
