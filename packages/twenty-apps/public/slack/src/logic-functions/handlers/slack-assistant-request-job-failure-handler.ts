import { CoreApiClient } from 'twenty-client-sdk/core';
import { type LogicFunctionJobFailure } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { findSlackAssistantRequestBySlackMessage } from 'src/logic-functions/data/find-slack-assistant-request-by-slack-message';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { claimSlackJobFailureReply } from 'src/logic-functions/utils/claim-slack-job-failure-reply';
import { getSlackAssistantFailureText } from 'src/logic-functions/utils/get-slack-assistant-failure-text';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';

const UNFINISHED_STATUSES: string[] = [
  SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
  SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
];

export const slackAssistantRequestJobFailureHandler = async ({
  payload,
  error,
}: LogicFunctionJobFailure<SlackEventsRequestBody>): Promise<object> => {
  const parsed = parseSlackAssistantRequest(payload);

  if (parsed.request === null) {
    return { skipped: true, reason: parsed.skipReason };
  }

  const { slackChannelId, slackMessageTimestamp } = parsed.request;

  const client = new CoreApiClient();

  const request = await findSlackAssistantRequestBySlackMessage(client, {
    slackChannelId,
    slackMessageTimestamp,
  });

  if (!isDefined(request)) {
    return { skipped: true, reason: 'Request was never recorded' };
  }

  if (!UNFINISHED_STATUSES.includes(request.status ?? '')) {
    return { skipped: true, reason: 'Request is already finished' };
  }

  const errorMessage = `${error.type}: ${error.message}`;

  if (await claimSlackJobFailureReply(request.id)) {
    await slackPostMessageHandler({
      slackChannelId,
      messageText: getSlackAssistantFailureText(errorMessage),
      parentMessageTimestamp: getSlackAssistantParentMessageTimestamp({
        slackThreadTimestamp: request.slackThreadTimestamp,
        slackMessageTimestamp,
      }),
    });
  }

  await updateSlackAssistantRequest(client, {
    id: request.id,
    status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
    errorMessage,
  });

  return { failed: true, reason: errorMessage };
};
