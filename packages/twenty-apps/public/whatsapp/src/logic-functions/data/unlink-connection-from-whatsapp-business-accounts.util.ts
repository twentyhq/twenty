import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_KV_KEY_PREFIXES } from 'src/constants/whatsapp-connection-kv-key-prefixes.constant';
import { findConnectedAccountIdByWhatsAppBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';

export const unlinkConnectionFromWhatsAppBusinessAccounts = async (connectedAccountId: string) => {
  const connectionKey = `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.businessAccountIdsByConnectedAccountId}${connectedAccountId}`;
  const whatsAppBusinessAccountIds = (await kv.get<string[]>(connectionKey)) ?? [];

  await Promise.all(
    whatsAppBusinessAccountIds.map(async (whatsAppBusinessAccountId) => {
      // another connection may have taken the account over since
      if (
        (await findConnectedAccountIdByWhatsAppBusinessAccountId(whatsAppBusinessAccountId)) !==
        connectedAccountId
      ) {
        return;
      }

      await kv.delete(
        `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.connectedAccountIdByBusinessAccountId}${whatsAppBusinessAccountId}`,
      );
    }),
  );

  await kv.delete(connectionKey);
};
