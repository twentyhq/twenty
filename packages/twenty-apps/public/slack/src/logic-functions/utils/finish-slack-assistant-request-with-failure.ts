import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { clearSlackAssistantThinkingReaction } from 'src/logic-functions/utils/clear-slack-assistant-thinking-reaction';

type SlackAssistantRequestFailureResult = {
  failed: true;
  reason: string;
};

export const finishSlackAssistantRequestWithFailure = async ({
  client,
  requestId,
  slackChannelId,
  slackMessageTimestamp,
  placeholderTimestamp,
  errorMessage,
}: {
  client: CoreApiClient;
  requestId: string;
  slackChannelId: string;
  slackMessageTimestamp: string;
  placeholderTimestamp: string;
  errorMessage: string;
}): Promise<SlackAssistantRequestFailureResult> => {
  await slackUpdateMessageHandler({
    slackChannelId,
    messageTimestamp: placeholderTimestamp,
    newMessageText: SLACK_ASSISTANT_FAILURE_TEXT,
  });
  await clearSlackAssistantThinkingReaction({
    slackChannelId,
    slackMessageTimestamp,
  });

  await updateSlackAssistantRequest(client, {
    id: requestId,
    status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage,
  });

  return { failed: true, reason: errorMessage };
};
