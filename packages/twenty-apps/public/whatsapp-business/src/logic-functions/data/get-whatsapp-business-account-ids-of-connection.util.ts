import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_CONNECTION_KV_KEY_PREFIXES } from 'src/constants/whatsapp-connection-kv-key-prefixes.constant';

export const getWhatsAppBusinessAccountIdsOfConnection = async (
  connectedAccountId: string,
): Promise<string[]> =>
  (await kv.get<string[]>(
    `${WHATSAPP_CONNECTION_KV_KEY_PREFIXES.businessAccountIdsByConnectedAccountId}${connectedAccountId}`,
  )) ?? [];
