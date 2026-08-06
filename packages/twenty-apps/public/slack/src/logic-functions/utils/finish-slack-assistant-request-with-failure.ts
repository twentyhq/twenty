import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import { clearSlackAssistantThinkingReaction } from 'src/logic-functions/utils/clear-slack-assistant-thinking-reaction';

type SlackAssistantRequestFailureResult = {
  failed: true;
  reason: string;
};

// With a placeholder (channel flow), the failure text replaces it and the
// thinking reaction is removed. Without one (DM agent flow), the failure text
// is posted as a thread reply, which also clears the thread's thinking status.
export const finishSlackAssistantRequestWithFailure = async ({
  client,
  requestId,
  slackChannelId,
  slackMessageTimestamp,
  parentMessageTimestamp,
  placeholderTimestamp,
  errorMessage,
}: {
  client: CoreApiClient;
  requestId: string;
  slackChannelId: string;
  slackMessageTimestamp: string;
  parentMessageTimestamp: string;
  placeholderTimestamp: string | undefined;
  errorMessage: string;
}): Promise<SlackAssistantRequestFailureResult> => {
  if (isNonEmptyString(placeholderTimestamp)) {
    await slackUpdateMessageHandler({
      slackChannelId,
      messageTimestamp: placeholderTimestamp,
      newMessageText: SLACK_ASSISTANT_FAILURE_TEXT,
    });
    await clearSlackAssistantThinkingReaction({
      slackChannelId,
      slackMessageTimestamp,
    });
  } else {
    await slackPostMessageHandler({
      slackChannelId,
      messageText: SLACK_ASSISTANT_FAILURE_TEXT,
      parentMessageTimestamp,
    });
  }

  await updateSlackAssistantRequest(client, {
    id: requestId,
    status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage,
  });

  return { failed: true, reason: errorMessage };
};
