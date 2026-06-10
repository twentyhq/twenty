import { createHmac } from 'crypto';

import { describe, expect, it } from 'vitest';

import { verifyRecallWebhookSignature } from 'src/logic-functions/utils/verify-recall-webhook-signature.util';

const SECRET_BYTES = Buffer.from('test-secret-abc123');
const SECRET = `whsec_${SECRET_BYTES.toString('base64')}`;
const WEBHOOK_ID = 'msg_123';
const WEBHOOK_TIMESTAMP = '1760000000';
const NOW = new Date(Number(WEBHOOK_TIMESTAMP) * 1000);

const sign = (body: string): string =>
  createHmac('sha256', SECRET_BYTES)
    .update(`${WEBHOOK_ID}.${WEBHOOK_TIMESTAMP}.${body}`)
    .digest('base64');

describe('verifyRecallWebhookSignature', () => {
  it('accepts valid Recall webhook-* signature headers', () => {
    const body = JSON.stringify({ event: 'recording.done' });

    const result = verifyRecallWebhookSignature({
      rawBody: body,
      secret: SECRET,
      now: NOW,
      headers: {
        'webhook-id': WEBHOOK_ID,
        'webhook-timestamp': WEBHOOK_TIMESTAMP,
        'webhook-signature': `v1,${sign(body)}`,
      },
    });

    expect(result).toEqual({ valid: true });
  });

  it('accepts valid svix-* signature headers', () => {
    const body = JSON.stringify({ event: 'recording.done' });

    const result = verifyRecallWebhookSignature({
      rawBody: body,
      secret: SECRET,
      now: NOW,
      headers: {
        'svix-id': WEBHOOK_ID,
        'svix-timestamp': WEBHOOK_TIMESTAMP,
        'svix-signature': `v1,${sign(body)}`,
      },
    });

    expect(result).toEqual({ valid: true });
  });

  it('rejects deliveries whose timestamp is outside of the tolerance', () => {
    const body = JSON.stringify({ event: 'recording.done' });

    const result = verifyRecallWebhookSignature({
      rawBody: body,
      secret: SECRET,
      now: new Date(Number(WEBHOOK_TIMESTAMP) * 1000 + 6 * 60 * 1000),
      headers: {
        'webhook-id': WEBHOOK_ID,
        'webhook-timestamp': WEBHOOK_TIMESTAMP,
        'webhook-signature': `v1,${sign(body)}`,
      },
    });

    expect(result).toEqual({
      valid: false,
      error: 'Webhook timestamp is outside of the allowed tolerance',
    });
  });

  it('rejects non-numeric timestamps', () => {
    const body = JSON.stringify({ event: 'recording.done' });

    const result = verifyRecallWebhookSignature({
      rawBody: body,
      secret: SECRET,
      now: NOW,
      headers: {
        'webhook-id': WEBHOOK_ID,
        'webhook-timestamp': 'not-a-timestamp',
        'webhook-signature': `v1,${sign(body)}`,
      },
    });

    expect(result).toEqual({
      valid: false,
      error: 'Invalid webhook timestamp',
    });
  });

  it('rejects missing signature headers', () => {
    const result = verifyRecallWebhookSignature({
      rawBody: '{}',
      secret: SECRET,
      headers: {},
    });

    expect(result).toEqual({
      valid: false,
      error: 'Missing webhook signature headers',
    });
  });

  it('rejects signatures computed from a different body', () => {
    const body = JSON.stringify({ event: 'recording.done' });

    const result = verifyRecallWebhookSignature({
      rawBody: JSON.stringify({ event: 'recording.failed' }),
      secret: SECRET,
      now: NOW,
      headers: {
        'webhook-id': WEBHOOK_ID,
        'webhook-timestamp': WEBHOOK_TIMESTAMP,
        'webhook-signature': `v1,${sign(body)}`,
      },
    });

    expect(result.valid).toBe(false);
  });
});
