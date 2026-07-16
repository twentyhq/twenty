import { createHmac } from 'crypto';

import { describe, expect, it } from 'vitest';

import { signDirectusProjection } from 'src/logic-functions/directus-api/sign-directus-projection.util';
import { verifyDirectusWebhookSignature } from 'src/logic-functions/directus-api/verify-directus-webhook-signature.util';

const WEBHOOK_SECRET = 'directus-webhook-secret-abc123';
const NOW = new Date('2026-07-16T12:00:00.000Z');
const TIMESTAMP = String(Math.floor(NOW.getTime() / 1000));

const createSignature = (body: string, timestamp: string): string =>
  createHmac('sha256', WEBHOOK_SECRET)
    .update(`${timestamp}.${body}`)
    .digest('base64');

describe('verifyDirectusWebhookSignature', () => {
  it('accepts a valid signature', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });
    const signature = createSignature(body, TIMESTAMP);

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature,
      timestamp: TIMESTAMP,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({ valid: true });
  });

  it('rejects a tampered signature (different body)', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });
    const signature = createSignature(body, TIMESTAMP);

    const result = verifyDirectusWebhookSignature({
      rawBody: JSON.stringify({ event: 'projection.sync', data: { tampered: true } }),
      signature,
      timestamp: TIMESTAMP,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Signature verification failed',
    });
  });

  it('rejects a tampered signature (different timestamp)', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });
    const otherTimestamp = String(Number(TIMESTAMP) - 100);
    const signature = createSignature(body, otherTimestamp);

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature,
      timestamp: TIMESTAMP,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Signature verification failed',
    });
  });

  it('rejects an expired timestamp (outside tolerance window)', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });
    const oldTimestamp = String(
      Math.floor(NOW.getTime() / 1000) - 6 * 60,
    );
    const signature = createSignature(body, oldTimestamp);

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature,
      timestamp: oldTimestamp,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Webhook timestamp is outside of the allowed tolerance',
    });
  });

  it('accepts a timestamp at the edge of the tolerance window', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });
    const edgeTimestamp = String(
      Math.floor(NOW.getTime() / 1000) - 5 * 60,
    );
    const signature = createSignature(body, edgeTimestamp);

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature,
      timestamp: edgeTimestamp,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({ valid: true });
  });

  it('rejects a non-numeric timestamp', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature: 'invalid-signature',
      timestamp: 'not-a-timestamp',
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Invalid webhook timestamp',
    });
  });

  it('rejects an empty signature', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature: '',
      timestamp: TIMESTAMP,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Signature verification failed',
    });
  });

  it('rejects a signature computed with a different secret', () => {
    const body = JSON.stringify({ event: 'projection.sync', data: {} });
    const signature = createSignature(body, TIMESTAMP);

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature,
      timestamp: TIMESTAMP,
      secret: 'different-secret',
      now: NOW,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Signature verification failed',
    });
  });
});

describe('signDirectusProjection ↔ verifyDirectusWebhookSignature round-trip', () => {
  it('signer output is accepted by the verifier', () => {
    const body = JSON.stringify({
      collection: 'executive_profiles',
      action: 'sync',
      records: [{ id: 1, name: 'Jane Doe' }],
    });

    const { timestamp, signature } = signDirectusProjection({
      body,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature,
      timestamp,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    expect(result).toEqual({ valid: true });
  });

  it('signer output is rejected by the verifier with a different secret', () => {
    const body = JSON.stringify({ test: 'data' });

    const { timestamp, signature } = signDirectusProjection({
      body,
      secret: WEBHOOK_SECRET,
      now: NOW,
    });

    const result = verifyDirectusWebhookSignature({
      rawBody: body,
      signature,
      timestamp,
      secret: 'different-secret',
      now: NOW,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Signature verification failed',
    });
  });
});
