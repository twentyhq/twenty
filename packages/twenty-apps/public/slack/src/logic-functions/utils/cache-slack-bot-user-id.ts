import { kv } from 'twenty-sdk/logic-function';

import { SLACK_BOT_USER_ID_KV_KEY } from 'src/logic-functions/constants/slack-bot-user-id-kv-key';
import { SLACK_BOT_USER_ID_TTL_MS } from 'src/logic-functions/constants/slack-bot-user-id-ttl-ms';
import { type SlackBotUserIdCacheEntry } from 'src/logic-functions/types/slack-bot-user-id-cache-entry.type';

export const cacheSlackBotUserId = async (botUserId: string): Promise<void> => {
  await kv
    .set(SLACK_BOT_USER_ID_KV_KEY, {
      botUserId,
      expiresAt: Date.now() + SLACK_BOT_USER_ID_TTL_MS,
    } satisfies SlackBotUserIdCacheEntry)
    .catch(async () => {
      await kv.delete(SLACK_BOT_USER_ID_KV_KEY).catch(() => undefined);
    });
};
