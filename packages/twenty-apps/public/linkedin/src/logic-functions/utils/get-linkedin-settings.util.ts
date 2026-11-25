import { kv } from 'twenty-sdk/logic-function';

import { DEFAULT_LINKEDIN_SETTINGS } from 'src/constants/default-linkedin-settings.constant';
import { LINKEDIN_HISTORY_CONVERSATION_LIMITS } from 'src/constants/linkedin-history-conversation-limits.constant';
import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const getLinkedinSettings = async (
  connectedAccountId: string,
): Promise<LinkedinSettings> => {
  const storedSettings = await kv.get<Partial<LinkedinSettings>>(
    getLinkedinConnectionKvKey({ kind: 'settings', connectedAccountId }),
  );
  const settings = { ...DEFAULT_LINKEDIN_SETTINGS, ...storedSettings };

  // Members could save a limit of 0 ("None") before the History tab existed
  return LINKEDIN_HISTORY_CONVERSATION_LIMITS.includes(
    settings.historyConversationLimit,
  )
    ? settings
    : {
        ...settings,
        historyConversationLimit:
          DEFAULT_LINKEDIN_SETTINGS.historyConversationLimit,
      };
};
