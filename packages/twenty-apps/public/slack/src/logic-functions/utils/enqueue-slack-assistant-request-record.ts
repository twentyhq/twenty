import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { createSlackAssistantRequest } from 'src/logic-functions/data/create-slack-assistant-request';
import { findSlackAssistantRequestBySlackMessage } from 'src/logic-functions/data/find-slack-assistant-request-by-slack-message';
import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';
import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { isDuplicateRecordError } from 'src/logic-functions/utils/is-duplicate-record-error';

const ALREADY_QUEUED_SKIP_REASON = 'Slack message is already queued';

export const enqueueSlackAssistantRequestRecord = async (
  request: SlackAssistantRequestDraft,
): Promise<SlackEventsEnqueueResult> => {
  const client = new CoreApiClient();

  const existingRequestId = await findSlackAssistantRequestBySlackMessage(
    client,
    {
      slackChannelId: request.slackChannelId,
      slackMessageTimestamp: request.slackMessageTimestamp,
    },
  );

  if (isDefined(existingRequestId)) {
    return { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };
  }

  let requestId: string;

  try {
    requestId = await createSlackAssistantRequest(client, request);
  } catch (error) {
    if (isDuplicateRecordError(error)) {
      return { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };
    }

    throw error;
  }

  return {
    ok: true,
    request: {
      id: requestId,
      status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
      slackChannelId: request.slackChannelId,
      slackChannelType: request.slackChannelType,
      slackThreadTimestamp: request.slackThreadTimestamp,
      slackMessageTimestamp: request.slackMessageTimestamp,
      slackUserId: request.slackUserId,
      requestText: request.requestText,
    },
  };
};
