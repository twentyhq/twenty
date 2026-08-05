import { kv } from 'twenty-sdk/logic-function';

import { getSlackEmptyRequestReplyKvKey } from 'src/logic-functions/utils/get-slack-empty-request-reply-kv-key';

export const releaseSlackEmptyRequestReply = async ({
  slackChannelId,
  slackMessageTimestamp,
}: {
  slackChannelId: string;
  slackMessageTimestamp: string;
}): Promise<void> => {
  await kv.delete(
    getSlackEmptyRequestReplyKvKey({ slackChannelId, slackMessageTimestamp }),
  );
};
