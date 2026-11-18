import { isNonEmptyString } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';

import { GRANOLA_WEBHOOK_PAYLOAD_SCHEMA } from 'src/logic-functions/types/granola-api.type';
import { parseJsonOrUndefined } from 'src/logic-functions/utils/parse-json-or-undefined.util';
import { verifyStandardWebhookSignature } from 'src/logic-functions/utils/verify-standard-webhook-signature.util';

export const parseSignedGranolaWebhookEvent = ({
  routePayload,
  receivedAt,
  signingSecret,
}: {
  routePayload: Pick<RoutePayload<unknown>, 'rawBody' | 'headers'>;
  receivedAt: number;
  signingSecret: string;
}) => {
  const rawBody = routePayload.rawBody;
  const webhookId = routePayload.headers['webhook-id'];
  const timestamp = routePayload.headers['webhook-timestamp'];
  const signature = routePayload.headers['webhook-signature'];

  if (
    !isNonEmptyString(rawBody) ||
    !isNonEmptyString(webhookId) ||
    !isNonEmptyString(timestamp) ||
    !isNonEmptyString(signature) ||
    !verifyStandardWebhookSignature({
      signingSecret,
      webhookId,
      timestamp,
      signature,
      rawBody,
      receivedAt,
    })
  ) {
    return { error: 'Invalid Granola webhook signature' };
  }

  const parsed = GRANOLA_WEBHOOK_PAYLOAD_SCHEMA.safeParse(
    parseJsonOrUndefined(rawBody),
  );

  if (!parsed.success || parsed.data.event_id !== webhookId) {
    return { error: 'Invalid Granola webhook event' };
  }

  return { event: parsed.data };
};
