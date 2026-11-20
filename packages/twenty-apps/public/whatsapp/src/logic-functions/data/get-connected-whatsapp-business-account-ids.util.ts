import { kv, listConnections } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_KV_KEY_PREFIXES } from 'src/constants/whatsapp-connection-kv-key-prefixes.constant';
import { WHATSAPP_CONNECTION_PROVIDER_NAME } from 'src/constants/whatsapp-connection-provider-name.constant';

export const getConnectedWhatsappBusinessAccountIds = async (): Promise<string[]> => {
  const connections = await listConnections({ providerName: WHATSAPP_CONNECTION_PROVIDER_NAME });

  const whatsappBusinessAccountIds = await Promise.all(
    connections.map(
      async ({ id }) =>
        (await kv.get<string[]>(
          `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.businessAccountIdsByConnectedAccountId}${id}`,
        )) ?? [],
    ),
  );

  return [...new Set(whatsappBusinessAccountIds.flat())];
};
