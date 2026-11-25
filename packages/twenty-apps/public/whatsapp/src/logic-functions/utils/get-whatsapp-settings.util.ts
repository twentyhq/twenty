import { kv } from 'twenty-sdk/logic-function';

import { DEFAULT_WHATSAPP_SETTINGS } from 'src/constants/default-whatsapp-settings.constant';
import { WHATSAPP_HISTORY_CONVERSATION_LIMITS } from 'src/constants/whatsapp-history-conversation-limits.constant';
import { getWhatsappConnectionKvKey } from 'src/logic-functions/utils/get-whatsapp-connection-kv-key.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

export const getWhatsappSettings = async (
  connectedAccountId: string,
): Promise<WhatsappSettings> => {
  const storedSettings = await kv.get<Partial<WhatsappSettings>>(
    getWhatsappConnectionKvKey({ kind: 'settings', connectedAccountId }),
  );
  const settings = { ...DEFAULT_WHATSAPP_SETTINGS, ...storedSettings };

  // Members could save a limit of 0 ("None") before the History tab existed
  return WHATSAPP_HISTORY_CONVERSATION_LIMITS.includes(
    settings.historyConversationLimit,
  )
    ? settings
    : {
        ...settings,
        historyConversationLimit:
          DEFAULT_WHATSAPP_SETTINGS.historyConversationLimit,
      };
};
