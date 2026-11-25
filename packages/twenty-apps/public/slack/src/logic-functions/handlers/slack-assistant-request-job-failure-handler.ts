import { CoreApiClient } from 'twenty-client-sdk/core';
import { type LogicFunctionJobFailure } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { findSlackAssistantRequestBySlackMessage } from 'src/logic-functions/data/find-slack-assistant-request-by-slack-message';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { finishSlackAssistantRequestWithFailure } from 'src/logic-functions/utils/finish-slack-assistant-request-with-failure';
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

  const client = new CoreApiClient();

  const request = await findSlackAssistantRequestBySlackMessage(client, {
    slackChannelId: parsed.request.slackChannelId,
    slackMessageTimestamp: parsed.request.slackMessageTimestamp,
  });

  if (
    !isDefined(request) ||
    !UNFINISHED_STATUSES.includes(request.status ?? '')
  ) {
    return { skipped: true, reason: 'Request is already finished' };
  }

  return await finishSlackAssistantRequestWithFailure({
    client,
    requestId: request.id,
    slackChannelId: parsed.request.slackChannelId,
    parentMessageTimestamp: getSlackAssistantParentMessageTimestamp({
      slackThreadTimestamp: request.slackThreadTimestamp,
      slackMessageTimestamp: parsed.request.slackMessageTimestamp,
    }),
    errorMessage: `${error.type}: ${error.message}`,
  });
};
