import { isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackEmptyRequestReplyKvKey } from 'src/logic-functions/utils/get-slack-empty-request-reply-kv-key';

// Slack redelivers an event for a few minutes when it is not acknowledged in
// time; an hour comfortably covers every retry of the same message
const SLACK_EMPTY_REQUEST_REPLY_TTL_MS = 60 * 60 * 1000;

type SlackEmptyRequestReplyClaim = {
  expiresAt: number;
};

export const claimSlackEmptyRequestReply = async ({
  slackChannelId,
  slackMessageTimestamp,
}: {
  slackChannelId: string;
  slackMessageTimestamp: string;
}): Promise<boolean> => {
  const key = getSlackEmptyRequestReplyKvKey({
    slackChannelId,
    slackMessageTimestamp,
  });
  const existingClaim = await kv.get<SlackEmptyRequestReplyClaim>(key);

  if (
    existingClaim !== null &&
    isNumber(existingClaim.expiresAt) &&
    existingClaim.expiresAt > Date.now()
  ) {
    return false;
  }

  await kv.set(key, {
    expiresAt: Date.now() + SLACK_EMPTY_REQUEST_REPLY_TTL_MS,
  } satisfies SlackEmptyRequestReplyClaim);

  return true;
};
