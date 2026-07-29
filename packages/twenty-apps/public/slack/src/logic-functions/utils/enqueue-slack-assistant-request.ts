import { CoreApiClient } from 'twenty-client-sdk/core';

import { createSlackAssistantRequest } from 'src/logic-functions/data/create-slack-assistant-request';
import { findSlackAssistantRequestBySlackMessage } from 'src/logic-functions/data/find-slack-assistant-request-by-slack-message';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { isDuplicateRecordError } from 'src/logic-functions/utils/is-duplicate-record-error';
import { isSlackThreadActive } from 'src/logic-functions/utils/is-slack-thread-active';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';

const ALREADY_QUEUED_SKIP_REASON = 'Slack message is already queued';

type SlackEventsEnqueueResult = { ok: boolean; skipped?: string };

export const enqueueSlackAssistantRequest = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  const parsed = parseSlackAssistantRequest(body);

  if (parsed.request === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  if (parsed.requiresActiveThreadSubscription) {
    const isActive = await isSlackThreadActive({
      channelId: parsed.request.slackChannelId,
      threadTimestamp: parsed.request.slackThreadTimestamp,
    });

    if (!isActive) {
      return {
        ok: true,
        skipped: 'Thread is not subscribed for unmentioned follow-ups',
      };
    }
  }

  const client = new CoreApiClient();

  const existingRequestId = await findSlackAssistantRequestBySlackMessage(
    client,
    {
      slackChannelId: parsed.request.slackChannelId,
      slackMessageTimestamp: parsed.request.slackMessageTimestamp,
    },
  );

  if (existingRequestId !== undefined) {
    return { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };
  }

  try {
    await createSlackAssistantRequest(client, parsed.request);
  } catch (error) {
    if (isDuplicateRecordError(error)) {
      return { ok: true, skipped: ALREADY_QUEUED_SKIP_REASON };
    }

    throw error;
  }

  return { ok: true };
};
