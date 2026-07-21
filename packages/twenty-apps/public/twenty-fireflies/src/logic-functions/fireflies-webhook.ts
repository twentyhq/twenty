import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'src/utils/is-defined';

import { FIREFLIES_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesWebhookHandler } from 'src/logic-functions/handlers/fireflies-webhook-handler';
import {
  type FirefliesWebhookPayload,
  type FirefliesWebhookResult,
} from 'src/logic-functions/types/fireflies-webhook-payload.type';
import { getFirefliesWebhookSecret } from 'src/logic-functions/utils/get-fireflies-webhook-secret';
import { verifyFirefliesWebhookSignature } from 'src/logic-functions/utils/verify-fireflies-webhook-signature';

const firefliesWebhookRouteHandler = async (
  routePayload: RoutePayload<FirefliesWebhookPayload>,
): Promise<FirefliesWebhookResult> => {
  const secretResult = getFirefliesWebhookSecret();

  if (!secretResult.success) {
    return { error: secretResult.error };
  }

  const { rawBody } = routePayload;

  if (!isDefined(rawBody)) {
    return {
      error:
        'Invalid webhook signature: raw request body was not forwarded by the server, cannot verify HMAC',
    };
  }

  const signatureHeader = routePayload.headers['x-hub-signature'];

  const signatureCheck = verifyFirefliesWebhookSignature({
    rawBody,
    signatureHeader,
    secret: secretResult.secret,
  });

  if (!signatureCheck.valid) {
    return { error: `Invalid webhook signature: ${signatureCheck.error}` };
  }

  const body = routePayload.body;

  if (!isDefined(body)) {
    return { error: 'Webhook payload was empty' };
  }

  return firefliesWebhookHandler({
    meetingId: body.meeting_id,
    eventType: body.event,
  });
};

export default defineLogicFunction({
  universalIdentifier: FIREFLIES_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-webhook',
  description:
    'Receives Fireflies webhook events when a transcript or summary is ready, then upserts a CallRecording record linked to the matching CalendarEvent.',
  timeoutSeconds: 60,
  handler: firefliesWebhookRouteHandler,
  httpRouteTriggerSettings: {
    path: '/webhook/fireflies',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-hub-signature'],
  },
});
