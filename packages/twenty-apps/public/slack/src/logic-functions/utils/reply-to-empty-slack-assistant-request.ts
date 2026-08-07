import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_EMPTY_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-request-text';
import { SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-thread-request-text';
import { type SlackAssistantEmptyRequest } from 'src/logic-functions/types/slack-assistant-empty-request.type';
import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { claimSlackEmptyRequestReply } from 'src/logic-functions/utils/claim-slack-empty-request-reply';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { postSlackMessage } from 'src/logic-functions/utils/post-slack-message';
import { releaseSlackEmptyRequestReply } from 'src/logic-functions/utils/release-slack-empty-request-reply';
import { subscribeSlackThread } from 'src/logic-functions/utils/subscribe-slack-thread';

export const replyToEmptySlackAssistantRequest = async (
  emptyRequest: SlackAssistantEmptyRequest,
): Promise<SlackEventsEnqueueResult> => {
  const claimReference = {
    slackChannelId: emptyRequest.slackChannelId,
    slackMessageTimestamp: emptyRequest.slackMessageTimestamp,
  };
  const isFirstReply = await claimSlackEmptyRequestReply(claimReference);

  if (!isFirstReply) {
    return { ok: true, skipped: 'Empty request was already answered' };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    await releaseSlackEmptyRequestReply(claimReference);

    throw new Error(slackClientResult.error);
  }

  const replyResult = await postSlackMessage(slackClientResult.client, {
    slackChannelId: emptyRequest.slackChannelId,
    messageText: emptyRequest.isInExistingThread
      ? SLACK_ASSISTANT_EMPTY_THREAD_REQUEST_TEXT
      : SLACK_ASSISTANT_EMPTY_REQUEST_TEXT,
    parentMessageTimestamp: emptyRequest.parentMessageTimestamp,
    messageFormat: 'markdown',
  });

  if (!replyResult.success) {
    await releaseSlackEmptyRequestReply(claimReference);

    throw new Error(
      `Failed to post the Slack empty request hint in channel ${emptyRequest.slackChannelId}: ${replyResult.error ?? replyResult.message}`,
    );
  }

  if (isNonEmptyString(emptyRequest.parentMessageTimestamp)) {
    await subscribeSlackThread({
      channelId: emptyRequest.slackChannelId,
      threadTimestamp: emptyRequest.parentMessageTimestamp,
    }).catch(() => undefined);
  }

  return { ok: true };
};
