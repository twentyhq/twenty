import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  createSlackAssistantRequest,
  findSlackAssistantRequestByEventId,
} from 'src/logic-functions/data/slack-assistant-request-store';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-event.type';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';

type SlackEventsEnqueueResult =
  | { challenge: string }
  | { ok: boolean; skipped?: string };

export const slackEventsEnqueueHandler = async (
  body: SlackEventsRequestBody,
): Promise<SlackEventsEnqueueResult> => {
  if (body.type === 'url_verification' && body.challenge !== undefined) {
    return { challenge: body.challenge };
  }

  const parsed = parseSlackAssistantRequest(body);

  if (parsed.request === null) {
    return { ok: true, skipped: parsed.skipReason };
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

export default defineLogicFunction({
  universalIdentifier: SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
  name: 'slack-events-enqueue',
  description:
    'Runs in the resolved workspace: answers the Slack url_verification handshake and enqueues a Slack Assistant Request record for the assistant worker.',
  timeoutSeconds: 15,
  handler: slackEventsEnqueueHandler,
});
