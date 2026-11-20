import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_BUSINESS_ACCOUNT_CONNECTIONS_KV_KEY } from 'src/constants/whatsapp-business-account-connections-kv-key.constant';
import { getWhatsappBusinessAccountConnections } from 'src/logic-functions/data/get-whatsapp-business-account-connections.util';

export const linkWhatsappBusinessAccountsToConnection = async ({
  connectedAccountId,
  whatsappBusinessAccountIds,
}: {
  connectedAccountId: string;
  whatsappBusinessAccountIds: string[];
}) => {
  const connections = await getWhatsappBusinessAccountConnections();

  for (const whatsappBusinessAccountId of whatsappBusinessAccountIds) {
    connections[whatsappBusinessAccountId] = connectedAccountId;
  }

  await kv.set(WHATSAPP_BUSINESS_ACCOUNT_CONNECTIONS_KV_KEY, connections);
};
