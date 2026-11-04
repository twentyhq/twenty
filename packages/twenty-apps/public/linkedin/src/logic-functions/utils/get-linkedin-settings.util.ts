import { kv } from 'twenty-sdk/logic-function';

import { DEFAULT_LINKEDIN_SETTINGS } from 'src/constants/default-linkedin-settings.constant';
import { getLinkedinConnectionKvKey } from 'src/logic-functions/utils/get-linkedin-connection-kv-key.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const getLinkedinSettings = async (
  connectedAccountId: string,
): Promise<LinkedinSettings> => {
  const storedSettings = await kv.get<Partial<LinkedinSettings>>(
    getLinkedinConnectionKvKey({ kind: 'settings', connectedAccountId }),
  );

  return { ...DEFAULT_LINKEDIN_SETTINGS, ...storedSettings };
};
