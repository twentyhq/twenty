import { kv } from 'twenty-sdk/logic-function';
import { WHATSAPP_BUSINESS_ACCOUNT_CONNECTIONS_KV_KEY } from 'src/constants/whatsapp-business-account-connections-kv-key.constant';

// connected account id by WhatsApp Business Account id
export const getWhatsappBusinessAccountConnections = async (): Promise<Record<string, string>> =>
  (await kv.get<Record<string, string>>(WHATSAPP_BUSINESS_ACCOUNT_CONNECTIONS_KV_KEY)) ?? {};
