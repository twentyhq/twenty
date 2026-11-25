import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_KV_KEY_PREFIXES } from 'src/constants/whatsapp-connection-kv-key-prefixes.constant';
import { findConnectedAccountIdByWhatsAppBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';

const buildBusinessAccountKey = (whatsAppBusinessAccountId: string) =>
  `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.connectedAccountIdByBusinessAccountId}${whatsAppBusinessAccountId}`;

export const linkWhatsAppBusinessAccountsToConnection = async ({
  connectedAccountId,
  whatsAppBusinessAccountIds,
}: {
  connectedAccountId: string;
  whatsAppBusinessAccountIds: string[];
}) => {
  const connectionKey = `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.businessAccountIdsByConnectedAccountId}${connectedAccountId}`;
  const previousWhatsAppBusinessAccountIds = (await kv.get<string[]>(connectionKey)) ?? [];

  await Promise.all(
    whatsAppBusinessAccountIds.map((whatsAppBusinessAccountId) =>
      kv.set(buildBusinessAccountKey(whatsAppBusinessAccountId), connectedAccountId),
    ),
  );

  // on reconnect, the token may have lost access to some accounts
  await Promise.all(
    previousWhatsAppBusinessAccountIds
      .filter((whatsAppBusinessAccountId) => !whatsAppBusinessAccountIds.includes(whatsAppBusinessAccountId))
      .map(async (whatsAppBusinessAccountId) => {
        if (
          (await findConnectedAccountIdByWhatsAppBusinessAccountId(whatsAppBusinessAccountId)) ===
          connectedAccountId
        ) {
          await kv.delete(buildBusinessAccountKey(whatsAppBusinessAccountId));
        }
      }),
  );

  await kv.set(connectionKey, whatsAppBusinessAccountIds);
};
