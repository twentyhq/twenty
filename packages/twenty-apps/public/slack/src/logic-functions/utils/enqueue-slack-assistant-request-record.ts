import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { createSlackAssistantRequest } from 'src/logic-functions/data/create-slack-assistant-request';
import { findSlackAssistantRequestBySlackMessage } from 'src/logic-functions/data/find-slack-assistant-request-by-slack-message';
import { type SlackAssistantRequestDraft } from 'src/logic-functions/types/slack-assistant-request-draft.type';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { isDuplicateRecordError } from 'src/logic-functions/utils/is-duplicate-record-error';
import { isSlackAssistantRequestResumable } from 'src/logic-functions/utils/is-slack-assistant-request-resumable';

const ALREADY_QUEUED_SKIP_REASON = 'Slack message is already queued';

const resolveExistingRequest = (
  existingRequest: SlackAssistantRequestRecord | undefined,
): SlackEventsEnqueueResult =>
  isDefined(existingRequest) &&
  isSlackAssistantRequestResumable(existingRequest)
    ? { ok: true, request: existingRequest }
    : { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };

export const enqueueSlackAssistantRequestRecord = async (
  request: SlackAssistantRequestDraft,
): Promise<SlackEventsEnqueueResult> => {
  const client = new CoreApiClient();
  const slackMessageKey = {
    slackChannelId: request.slackChannelId,
    slackMessageTimestamp: request.slackMessageTimestamp,
  };

  const existingRequest = await findSlackAssistantRequestBySlackMessage(
    client,
    slackMessageKey,
  );

  if (isDefined(existingRequest)) {
    return resolveExistingRequest(existingRequest);
  }

  try {
    const requestId = await createSlackAssistantRequest(client, request);

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
  } catch (error) {
    if (isDuplicateRecordError(error)) {
      return resolveExistingRequest(
        await findSlackAssistantRequestBySlackMessage(client, slackMessageKey),
      );
    }

    throw error;
  }
};
