import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  LINE_LOGIC_FUNCTION_PROCESS_EVENT_UNIVERSAL_IDENTIFIER,
  LINE_LOGIC_FUNCTION_RECEIVE_WEBHOOK_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { isHandledLineEvent } from 'src/logic-functions/data/is-handled-line-event.util';
import { findConnectedAccountIdByBotUserId } from 'src/logic-functions/data/link-bot-to-connection.util';
import { validateWebhookSignature } from 'src/logic-functions/data/validate-webhook-signature.util';
import { type LineWebhook } from 'src/logic-functions/types/line-webhook.type';
import { type ProcessEventPayload } from 'src/logic-functions/types/process-event-payload.type';

// LINE expects a quick 200, so each event is queued and processed on its own
const handler = async ({
  rawBody,
  body,
  headers,
}: RoutePayload<LineWebhook>) => {
  const channelSecret = process.env.CHANNEL_SECRET;

  if (!isNonEmptyString(channelSecret)) {
    console.error('CHANNEL_SECRET is not configured');

    return new Response('', { status: 500 });
  }

  const signature = headers['x-line-signature'];

  if (
    !isDefined(rawBody) ||
    !isNonEmptyString(signature) ||
    !validateWebhookSignature({ signature, payload: rawBody, channelSecret })
  ) {
    return new Response('', { status: 401 });
  }

  if (
    !isDefined(body) ||
    !isNonEmptyString(body.destination) ||
    !Array.isArray(body.events)
  ) {
    return new Response('', { status: 400 });
  }

  // the console's Verify button sends an empty event list
  if (body.events.length === 0) {
    return new Response('', { status: 200 });
  }

  if (!isDefined(await findConnectedAccountIdByBotUserId(body.destination))) {
    console.warn(
      `Ignoring LINE events for bot ${body.destination}, it is not connected`,
    );

    return new Response('', { status: 200 });
  }

  const payloads: ProcessEventPayload[] = body.events
    .filter(isHandledLineEvent)
    .map((event) => ({ botUserId: body.destination, event }));

  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      LINE_LOGIC_FUNCTION_PROCESS_EVENT_UNIVERSAL_IDENTIFIER,
    payloads,
    getJobKey: ({ event }) => event.webhookEventId,
  });

  return new Response('', { status: 200 });
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_RECEIVE_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'receive-webhook',
  description:
    'Receives LINE webhooks, checks they come from LINE and queues each event for processing',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/line',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-line-signature'],
  },
});
