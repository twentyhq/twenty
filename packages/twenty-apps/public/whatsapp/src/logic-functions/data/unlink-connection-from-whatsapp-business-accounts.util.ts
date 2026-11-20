import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_KV_KEY_PREFIXES } from 'src/constants/whatsapp-connection-kv-key-prefixes.constant';
import { findConnectedAccountIdByWhatsappBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';

export const unlinkConnectionFromWhatsappBusinessAccounts = async (connectedAccountId: string) => {
  const connectionKey = `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.businessAccountIdsByConnectedAccountId}${connectedAccountId}`;
  const whatsappBusinessAccountIds = (await kv.get<string[]>(connectionKey)) ?? [];

  await Promise.all(
    whatsappBusinessAccountIds.map(async (whatsappBusinessAccountId) => {
      // another connection may have taken the account over since
      if (
        (await findConnectedAccountIdByWhatsappBusinessAccountId(whatsappBusinessAccountId)) !==
        connectedAccountId
      ) {
        return;
      }

      await kv.delete(
        `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.connectedAccountIdByBusinessAccountId}${whatsappBusinessAccountId}`,
      );
    }),
  );

  await kv.delete(connectionKey);
};
