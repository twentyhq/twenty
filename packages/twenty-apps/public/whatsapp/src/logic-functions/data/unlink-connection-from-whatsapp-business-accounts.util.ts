import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_BUSINESS_ACCOUNT_CONNECTIONS_KV_KEY } from 'src/constants/whatsapp-business-account-connections-kv-key.constant';
import { getWhatsappBusinessAccountConnections } from 'src/logic-functions/data/get-whatsapp-business-account-connections.util';

export const unlinkConnectionFromWhatsappBusinessAccounts = async (connectedAccountId: string) => {
  const connections = await getWhatsappBusinessAccountConnections();

  await kv.set(
    WHATSAPP_BUSINESS_ACCOUNT_CONNECTIONS_KV_KEY,
    Object.fromEntries(
      Object.entries(connections).filter(
        ([, linkedConnectedAccountId]) => linkedConnectedAccountId !== connectedAccountId,
      ),
    ),
  );
};
