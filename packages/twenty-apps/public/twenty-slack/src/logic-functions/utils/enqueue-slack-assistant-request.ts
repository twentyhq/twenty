import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  createSlackAssistantRequest,
  findSlackAssistantRequestByEventId,
} from 'src/logic-functions/data/slack-assistant-request-store';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-event.type';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { isSlackThreadActive } from 'src/logic-functions/utils/slack-thread-subscription';

export type SlackEventsEnqueueResult =
  | { challenge: string }
  | { ok: boolean; skipped?: string };

export const enqueueSlackAssistantRequest = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  if (body.type === 'url_verification' && body.challenge !== undefined) {
    return { challenge: body.challenge };
  }

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

  const existingRequestId = await findSlackAssistantRequestByEventId(
    client,
    parsed.request.slackEventId,
  );

  if (existingRequestId !== undefined) {
    return { ok: true, skipped: 'Duplicate event_id' };
  }

  await createSlackAssistantRequest(client, parsed.request);

  return { ok: true };
};
