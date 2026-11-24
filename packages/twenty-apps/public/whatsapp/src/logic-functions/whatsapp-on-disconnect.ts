import { defineLogicFunction } from 'twenty-sdk/define';
import { listConnections } from 'twenty-sdk/logic-function';

import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';
import { WHATSAPP_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappConnectionHookPayload } from 'src/logic-functions/types/whatsapp-connection-hook-payload.type';
import { removeWhatsappConnectionResources } from 'src/logic-functions/utils/remove-whatsapp-connection-resources.util';

// getConnection throws for auth-failed connections, which are the ones members
// most often remove, so the Unipile account id is read from the list instead.
const findUnipileAccountId = async (
  connectedAccountId: string,
): Promise<string | null> => {
  const connections = await listConnections({
    providerName: WHATSAPP_PROVIDER_NAME,
  });

  return (
    connections.find((connection) => connection.id === connectedAccountId)
      ?.externalAccountId ?? null
  );
};

export const whatsappOnDisconnectHandler = async ({
  connectedAccountId,
}: WhatsappConnectionHookPayload): Promise<{ success: true }> => {
  await removeWhatsappConnectionResources({
    connectedAccountId,
    unipileAccountId: await findUnipileAccountId(connectedAccountId),
  });

  return { success: true };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-on-disconnect',
  description:
    'Deletes the message channel and the Unipile account of a removed WhatsApp connection.',
  timeoutSeconds: 30,
  handler: whatsappOnDisconnectHandler,
});
