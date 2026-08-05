import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

export const fetchSlackAssistantBotId = async (
  client: WebClient,
): Promise<string | undefined> => {
  try {
    const authResult = await client.auth.test();

    return isNonEmptyString(authResult.bot_id) ? authResult.bot_id : undefined;
  } catch {
    return undefined;
  }
};
