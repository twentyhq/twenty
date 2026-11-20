import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_KV_KEY_PREFIXES } from 'src/constants/whatsapp-connection-kv-key-prefixes.constant';
import { findConnectedAccountIdByWhatsappBusinessAccountId } from 'src/logic-functions/data/find-connected-account-id-by-whatsapp-business-account-id.util';

const buildBusinessAccountKey = (whatsappBusinessAccountId: string) =>
  `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.connectedAccountIdByBusinessAccountId}${whatsappBusinessAccountId}`;

export const linkWhatsappBusinessAccountsToConnection = async ({
  connectedAccountId,
  whatsappBusinessAccountIds,
}: {
  connectedAccountId: string;
  whatsappBusinessAccountIds: string[];
}) => {
  const connectionKey = `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.businessAccountIdsByConnectedAccountId}${connectedAccountId}`;
  const previousWhatsappBusinessAccountIds = (await kv.get<string[]>(connectionKey)) ?? [];

  await Promise.all(
    whatsappBusinessAccountIds.map((whatsappBusinessAccountId) =>
      kv.set(buildBusinessAccountKey(whatsappBusinessAccountId), connectedAccountId),
    ),
  );

  // on reconnect, the token may have lost access to some accounts
  await Promise.all(
    previousWhatsappBusinessAccountIds
      .filter((whatsappBusinessAccountId) => !whatsappBusinessAccountIds.includes(whatsappBusinessAccountId))
      .map(async (whatsappBusinessAccountId) => {
        if (
          (await findConnectedAccountIdByWhatsappBusinessAccountId(whatsappBusinessAccountId)) ===
          connectedAccountId
        ) {
          await kv.delete(buildBusinessAccountKey(whatsappBusinessAccountId));
        }
      }),
  );

  await kv.set(connectionKey, whatsappBusinessAccountIds);
};
