import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { clearSlackAssistantThinkingReaction } from 'src/logic-functions/utils/clear-slack-assistant-thinking-reaction';

export const SLACK_ASSISTANT_FAILURE_TEXT =
  'Sorry, I could not complete that request. An admin can check the Slack Assistant Request record in Twenty for details.';

export const finishSlackAssistantRequestWithFailure = async ({
  client,
  requestId,
  slackChannelId,
  slackMessageTimestamp,
  placeholderTimestamp,
  errorMessage,
  slackMessageText = SLACK_ASSISTANT_FAILURE_TEXT,
}: {
  client: CoreApiClient;
  requestId: string;
  slackChannelId: string;
  slackMessageTimestamp: string;
  placeholderTimestamp: string;
  errorMessage: string;
  slackMessageText?: string;
}): Promise<object> => {
  await slackUpdateMessageHandler({
    slackChannelId,
    messageTimestamp: placeholderTimestamp,
    newMessageText: slackMessageText,
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
