import { kv } from 'twenty-sdk/logic-function';

import { DEFAULT_WHATSAPP_SETTINGS } from 'src/constants/default-whatsapp-settings.constant';
import { getWhatsappConnectionKvKey } from 'src/logic-functions/utils/get-whatsapp-connection-kv-key.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const getWhatsappSettings = async (
  connectedAccountId: string,
): Promise<WhatsappSettings> => {
  const storedSettings = await kv.get<Partial<WhatsappSettings>>(
    getWhatsappConnectionKvKey({ kind: 'settings', connectedAccountId }),
  );

  return { ...DEFAULT_WHATSAPP_SETTINGS, ...storedSettings };
};
