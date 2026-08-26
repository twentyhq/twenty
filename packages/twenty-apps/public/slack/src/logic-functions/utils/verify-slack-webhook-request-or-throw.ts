import { type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { getSlackWebhookSecret } from 'src/logic-functions/utils/get-slack-webhook-secret';
import { verifySlackRequestSignature } from 'src/logic-functions/utils/verify-slack-request-signature';

export const verifySlackWebhookRequestOrThrow = (
  routePayload: RoutePayload<unknown>,
): void => {
  const secretResult = getSlackWebhookSecret();

  if (!secretResult.success) {
    throw new Error(secretResult.error);
  }

  if (!isDefined(routePayload.rawBody)) {
    throw new Error(
      'Raw request body was not forwarded by the server; cannot verify the webhook signature',
    );
  }

  const hasValidSignature = verifySlackRequestSignature({
    rawBody: routePayload.rawBody,
    signatureHeader: routePayload.headers['x-slack-signature'],
    timestampHeader: routePayload.headers['x-slack-request-timestamp'],
    secret: secretResult.secret,
  });

  if (!hasValidSignature) {
    throw new Error('Invalid Slack signature');
  }
};
