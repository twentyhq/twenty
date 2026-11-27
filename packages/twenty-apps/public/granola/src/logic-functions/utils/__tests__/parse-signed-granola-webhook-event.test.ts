import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { parseSignedGranolaWebhookEvent } from 'src/logic-functions/utils/parse-signed-granola-webhook-event.util';

const SIGNING_KEY = Buffer.from('granola-test-signing-key');
const SIGNING_SECRET = `whsec_${SIGNING_KEY.toString('base64')}`;
const DELIVERY_ID = 'evt_123';
const RECEIVED_AT = 1788566400000;
const TIMESTAMP = String(RECEIVED_AT / 1000);
const EVENT = {
  event_id: DELIVERY_ID,
  event_type: 'note.generated',
  note_id: 'not_12345678901234',
};

const buildSignedRoutePayload = (rawBody: string) => {
  const signature = createHmac('sha256', SIGNING_KEY)
    .update(`${DELIVERY_ID}.${TIMESTAMP}.${rawBody}`)
    .digest('base64');

  return {
    rawBody,
    headers: {
      'webhook-id': DELIVERY_ID,
      'webhook-timestamp': TIMESTAMP,
      'webhook-signature': `v1,${signature}`,
    },
  };
};

describe('parseSignedGranolaWebhookEvent', () => {
  it('returns the Granola event from a verified delivery', () => {
    expect(
      parseSignedGranolaWebhookEvent({
        routePayload: buildSignedRoutePayload(JSON.stringify(EVENT)),
        receivedAt: RECEIVED_AT,
        signingSecret: SIGNING_SECRET,
      }),
    ).toEqual({ event: EVENT });
  });

  it('rejects a modified raw body before considering its event fields', () => {
    const routePayload = buildSignedRoutePayload(JSON.stringify(EVENT));

    expect(
      parseSignedGranolaWebhookEvent({
        routePayload: { ...routePayload, rawBody: '{}' },
        receivedAt: RECEIVED_AT,
        signingSecret: SIGNING_SECRET,
      }),
    ).toEqual({ error: 'Invalid Granola webhook signature' });
  });

  it('rejects a signed payload whose event ID differs from the delivery ID', () => {
    const rawBody = JSON.stringify({ ...EVENT, event_id: 'evt_other' });

    expect(
      parseSignedGranolaWebhookEvent({
        routePayload: buildSignedRoutePayload(rawBody),
        receivedAt: RECEIVED_AT,
        signingSecret: SIGNING_SECRET,
      }),
    ).toEqual({ error: 'Invalid Granola webhook event' });
  });
});
