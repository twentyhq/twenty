import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_KV_KEY_PREFIXES } from 'src/constants/whatsapp-connection-kv-key-prefixes.constant';

export const findConnectedAccountIdByWhatsAppBusinessAccountId = async (
  whatsAppBusinessAccountId: string,
): Promise<string | undefined> =>
  (await kv.get<string>(
    `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.connectedAccountIdByBusinessAccountId}${whatsAppBusinessAccountId}`,
  )) ?? undefined;
