import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_BOT_USER_ID_KV_KEY } from 'src/logic-functions/constants/slack-bot-user-id-kv-key';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

export const resolveSlackBotUserId = async (): Promise<string> => {
  const cachedBotUserId = await kv.get<string>(SLACK_BOT_USER_ID_KV_KEY);

  if (isNonEmptyString(cachedBotUserId)) {
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

  await kv
    .set(SLACK_BOT_USER_ID_KV_KEY, authResult.user_id)
    .catch(() => undefined);

  return authResult.user_id;
};
