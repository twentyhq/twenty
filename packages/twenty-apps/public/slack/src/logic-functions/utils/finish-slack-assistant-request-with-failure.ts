import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';

type SlackAssistantRequestFailureResult = {
  failed: true;
  reason: string;
};

export const finishSlackAssistantRequestWithFailure = async ({
  client,
  requestId,
  slackChannelId,
  parentMessageTimestamp,
  errorMessage,
}: {
  client: CoreApiClient;
  requestId: string;
  slackChannelId: string;
  parentMessageTimestamp: string;
  errorMessage: string;
}): Promise<SlackAssistantRequestFailureResult> => {
  await slackPostMessageHandler({
    slackChannelId,
    messageText: SLACK_ASSISTANT_FAILURE_TEXT,
    parentMessageTimestamp,
    messageBlocks: [
      {
        type: 'alert',
        level: 'warning',
        text: { type: 'plain_text', text: SLACK_ASSISTANT_FAILURE_TEXT },
      },
    ],
  });

  await updateSlackAssistantRequest(client, {
    id: requestId,
    status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage,
  });

  return { failed: true, reason: errorMessage };
};
