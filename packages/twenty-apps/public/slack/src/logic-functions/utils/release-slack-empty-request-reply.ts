import { kv } from 'twenty-sdk/logic-function';

import { type SlackMessageReference } from 'src/logic-functions/types/slack-message-reference.type';
import { getSlackEmptyRequestReplyKvKey } from 'src/logic-functions/utils/get-slack-empty-request-reply-kv-key';

export const releaseSlackEmptyRequestReply = async ({
  slackChannelId,
  slackMessageTimestamp,
}: SlackMessageReference): Promise<void> => {
  await kv.delete(
    getSlackEmptyRequestReplyKvKey({ slackChannelId, slackMessageTimestamp }),
  );
};
