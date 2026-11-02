import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import { LINKEDIN_PROVIDER_NAME } from 'src/constants/linkedin-provider-name.constant';
import { LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinConnectionHookPayload } from 'src/logic-functions/types/linkedin-connection-hook-payload.type';
import { removeLinkedinConnectionResources } from 'src/logic-functions/utils/remove-linkedin-connection-resources.util';

// getConnection throws for auth-failed connections, which are the ones members
// most often remove, so the Unipile account id is read from the list instead.
const findUnipileAccountId = async (
  connectedAccountId: string,
): Promise<string | null> => {
  const connections = await listConnections({
    providerName: LINKEDIN_PROVIDER_NAME,
  });

  return (
    connections.find((connection) => connection.id === connectedAccountId)
      ?.externalAccountId ?? null
  );
};

export const linkedinOnDisconnectHandler = async ({
  connectedAccountId,
}: LinkedinConnectionHookPayload): Promise<{ success: true }> => {
  await removeLinkedinConnectionResources({
    connectedAccountId,
    unipileAccountId: await findUnipileAccountId(connectedAccountId),
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-on-disconnect',
  description:
    'Deletes the message channel and the Unipile account of a removed LinkedIn connection.',
  timeoutSeconds: 30,
  handler: linkedinOnDisconnectHandler,
});
