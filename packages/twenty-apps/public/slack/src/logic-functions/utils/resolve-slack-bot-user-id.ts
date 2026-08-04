import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_BOT_USER_ID_KV_KEY } from 'src/logic-functions/constants/slack-bot-user-id-kv-key';
import { type SlackBotUserIdCacheEntry } from 'src/logic-functions/types/slack-bot-user-id-cache-entry.type';
import { cacheSlackBotUserId } from 'src/logic-functions/utils/cache-slack-bot-user-id';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

const readCachedBotUserId = async (): Promise<string | undefined> => {
  const cacheEntry = await kv
    .get<SlackBotUserIdCacheEntry>(SLACK_BOT_USER_ID_KV_KEY)
    .catch(() => null);

  if (
    cacheEntry === null ||
    !isNonEmptyString(cacheEntry.botUserId) ||
    !isNumber(cacheEntry.expiresAt) ||
    cacheEntry.expiresAt <= Date.now()
  ) {
    return undefined;
  }

  return cacheEntry.botUserId;
};

export const resolveSlackBotUserId = async (): Promise<string> => {
  const cachedBotUserId = await readCachedBotUserId();

  if (cachedBotUserId !== undefined) {
    return cachedBotUserId;
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    throw new Error(slackClientResult.error);
  }

  const authResult = await slackClientResult.client.auth.test();

  if (!isNonEmptyString(authResult.user_id)) {
    throw new Error('Slack auth.test returned no user_id for the bot');
  }

  await cacheSlackBotUserId(authResult.user_id);

  return authResult.user_id;
};
