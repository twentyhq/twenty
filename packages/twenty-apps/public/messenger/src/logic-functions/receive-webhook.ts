import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  MESSENGER_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
  MESSENGER_LOGIC_FUNCTION_RECEIVE_WEBHOOK_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { buildParseMessagePayloads } from 'src/logic-functions/data/build-parse-message-payloads.util';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findConnectedAccountIdByPageId } from 'src/logic-functions/data/find-connected-account-id-by-page-id.util';
import { getMessengerEventJobKey } from 'src/logic-functions/data/get-messenger-event-job-key.util';
import { validateWebhookSignature } from 'src/logic-functions/data/validate-webhook-signature.util';
import { type MessengerWebhook } from 'src/logic-functions/types/messenger-webhook.type';

// Meta expects a 200 within 5 seconds and unsubscribes the Page after an hour of failures, so work is queued
const handler = async ({
  rawBody,
  body,
  headers,
}: RoutePayload<MessengerWebhook>) => {
  const appSecret = process.env.APP_SECRET;

  if (!isNonEmptyString(appSecret)) {
    console.error('APP_SECRET is not configured');

    return new Response('', { status: 500 });
  }

  const signature = headers['x-hub-signature-256'];

  if (
    !isDefined(rawBody) ||
    !isNonEmptyString(signature) ||
    !validateWebhookSignature({ signature, payload: rawBody, appSecret })
  ) {
    return new Response('', { status: 401 });
  }

  if (!isDefined(body) || body.object !== 'page') {
    return new Response('', { status: 400 });
  }

  const payloads = [];

  for (const payload of buildParseMessagePayloads(body)) {
    if (isDefined(await findConnectedAccountIdByPageId(payload.pageId))) {
      payloads.push(payload);
    } else {
      console.warn(
        `Ignoring Messenger event for Page ${payload.pageId}, it is not connected`,
      );
    }
  }

  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      MESSENGER_LOGIC_FUNCTION_PARSE_MESSAGE_UNIVERSAL_IDENTIFIER,
    payloads,
    getJobKey: ({ event }) => getMessengerEventJobKey(event),
  });

  return new Response('EVENT_RECEIVED', { status: 200 });
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_RECEIVE_WEBHOOK_UNIVERSAL_IDENTIFIER,
  name: 'receive-webhook',
  description:
    'Receives Messenger webhooks, checks they come from Meta and queues each event for processing',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/messenger',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-hub-signature-256'],
  },
});
