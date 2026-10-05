import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackMessageReference } from 'src/logic-functions/types/slack-message-reference.type';
import { getSlackEmptyRequestReplyKvKey } from 'src/logic-functions/utils/get-slack-empty-request-reply-kv-key';
import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

const SLACK_EMPTY_REQUEST_REPLY_TTL_MS = 60 * 60 * 1000;

type SlackEmptyRequestReplyClaim = {
  expiresAt: number;
};

export const claimSlackEmptyRequestReply = async ({
  slackChannelId,
  slackMessageTimestamp,
}: SlackMessageReference): Promise<boolean> => {
  const key = getSlackEmptyRequestReplyKvKey({
    slackChannelId,
    slackMessageTimestamp,
  });
  const existingClaim = await kv.get<SlackEmptyRequestReplyClaim>(key);

  if (isDefined(existingClaim) && !hasKvEntryExpired(existingClaim)) {
    return false;
  }

  await kv.set(key, {
    expiresAt: Date.now() + SLACK_EMPTY_REQUEST_REPLY_TTL_MS,
  });

  return true;
};
