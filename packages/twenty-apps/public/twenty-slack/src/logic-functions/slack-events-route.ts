import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  createSlackAssistantRequest,
  findSlackAssistantRequestByEventId,
} from 'src/logic-functions/data/slack-assistant-request-store';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-event.type';
import { getSlackSigningSecret } from 'src/logic-functions/utils/get-slack-signing-secret';
import { parseSlackAssistantRequest } from 'src/logic-functions/utils/parse-slack-assistant-request';
import { verifySlackRequestSignature } from 'src/logic-functions/utils/verify-slack-request-signature';

type SlackEventsRouteResult =
  | { challenge: string }
  | { ok: boolean; skipped?: string; error?: string };

// Slack expects a 200 within 3 seconds, so this route only verifies, dedups,
// and enqueues; the assistant worker picks the request up from the created
// slackAssistantRequest record.
const handler = async (
  event: RoutePayload<SlackEventsRequestBody>,
): Promise<SlackEventsRouteResult> => {
  const secretResult = getSlackSigningSecret();

  if (!secretResult.success) {
    return { ok: false, error: secretResult.error };
  }

  if (event.rawBody === undefined) {
    return { ok: false, error: 'Raw request body was not forwarded' };
  }

  const signatureCheck = verifySlackRequestSignature({
    rawBody: event.rawBody,
    signatureHeader: event.headers['x-slack-signature'],
    timestampHeader: event.headers['x-slack-request-timestamp'],
    secret: secretResult.secret,
  });

  if (!signatureCheck.valid) {
    return { ok: false, error: signatureCheck.error };
  }

  const body = event.body;

  if (!body) {
    return { ok: false, error: 'Empty request body' };
  }

  if (body.type === 'url_verification' && body.challenge !== undefined) {
    return { challenge: body.challenge };
  }

  // Slack retries when it does not get a fast 200; the original delivery is
  // already queued (or still being processed), so retries are dropped.
  if (event.headers['x-slack-retry-num'] !== undefined) {
    return { ok: true, skipped: 'Slack retry delivery' };
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
  universalIdentifier: SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'slack-events-route',
  description:
    'Receives Slack Events API callbacks (@mentions and DMs to the bot), verifies the request signature, and enqueues a Slack Assistant Request record for the assistant worker.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/slack/events',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [
      'x-slack-signature',
      'x-slack-request-timestamp',
      'x-slack-retry-num',
    ],
  },
});
