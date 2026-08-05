import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_EMPTY_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-request-text';
import { type SlackAssistantEmptyRequest } from 'src/logic-functions/types/slack-assistant-empty-request.type';
import { claimSlackEmptyRequestReply } from 'src/logic-functions/utils/claim-slack-empty-request-reply';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { postSlackMessage } from 'src/logic-functions/utils/post-slack-message';
import { releaseSlackEmptyRequestReply } from 'src/logic-functions/utils/release-slack-empty-request-reply';
import { subscribeSlackThread } from 'src/logic-functions/utils/subscribe-slack-thread';

type SlackEmptyRequestReplyResult = { ok: boolean; skipped?: string };

export const replyToEmptySlackAssistantRequest = async (
  emptyRequest: SlackAssistantEmptyRequest,
): Promise<SlackEmptyRequestReplyResult> => {
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

    return { ok: true, skipped: 'Slack is not connected' };
  }

  const replyResult = await postSlackMessage(slackClientResult.client, {
    slackChannelId: emptyRequest.slackChannelId,
    messageText: SLACK_ASSISTANT_EMPTY_REQUEST_TEXT,
    parentMessageTimestamp: emptyRequest.parentMessageTimestamp,
    messageFormat: 'plain',
  });

  if (!replyResult.success) {
    await releaseSlackEmptyRequestReply(claimReference);

    return {
      ok: true,
      skipped: `Could not post the empty request hint: ${replyResult.error ?? replyResult.message}`,
    };
  }

  if (isNonEmptyString(emptyRequest.parentMessageTimestamp)) {
    await subscribeSlackThread({
      channelId: emptyRequest.slackChannelId,
      threadTimestamp: emptyRequest.parentMessageTimestamp,
    }).catch(() => undefined);
  }

  return { ok: true };
};
