import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { clearSlackAssistantThinkingReaction } from 'src/logic-functions/utils/clear-slack-assistant-thinking-reaction';

type SlackAssistantRequestFailureResult = {
  failed: true;
  reason: string;
};

// The failure text posts as a thread reply, which also clears the thread's
// thinking status
export const finishSlackAssistantRequestWithFailure = async ({
  client,
  requestId,
  slackChannelId,
  slackMessageTimestamp,
  parentMessageTimestamp,
  hasThinkingReaction,
  errorMessage,
}: {
  client: CoreApiClient;
  requestId: string;
  slackChannelId: string;
  slackMessageTimestamp: string;
  parentMessageTimestamp: string;
  hasThinkingReaction: boolean;
  errorMessage: string;
}): Promise<SlackAssistantRequestFailureResult> => {
  await slackPostMessageHandler({
    slackChannelId,
    messageText: SLACK_ASSISTANT_FAILURE_TEXT,
    parentMessageTimestamp,
  });

  if (hasThinkingReaction) {
    await clearSlackAssistantThinkingReaction({
      slackChannelId,
      slackMessageTimestamp,
    });
  }

  await updateSlackAssistantRequest(client, {
    id: requestId,
    status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage,
  });

  return { failed: true, reason: errorMessage };
};
