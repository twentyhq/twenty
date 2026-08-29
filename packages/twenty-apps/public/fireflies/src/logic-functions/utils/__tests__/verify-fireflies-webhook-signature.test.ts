import { createHmac } from 'crypto';

import { describe, expect, it } from 'vitest';

import { verifyFirefliesWebhookSignature } from 'src/logic-functions/utils/verify-fireflies-webhook-signature';

const SECRET = 'test-secret-abc123';

const sign = (body: string): string =>
  createHmac('sha256', SECRET).update(body, 'utf8').digest('hex');

describe('verifyFirefliesWebhookSignature', () => {
  it('accepts a valid bare-hex signature', () => {
    const body = JSON.stringify({ meetingId: 'm1' });
    const signature = sign(body);

    const result = verifyFirefliesWebhookSignature({
      rawBody: body,
      signatureHeader: signature,
      secret: SECRET,
    });

    expect(result).toEqual({ valid: true });
  });

  it('accepts a valid signature with sha256= prefix', () => {
    const body = JSON.stringify({ meetingId: 'm1' });
    const signature = `sha256=${sign(body)}`;

    const result = verifyFirefliesWebhookSignature({
      rawBody: body,
      signatureHeader: signature,
      secret: SECRET,
    });

    expect(result).toEqual({ valid: true });
  });

  it('rejects when signature header is missing', () => {
    const result = verifyFirefliesWebhookSignature({
      rawBody: '{}',
      signatureHeader: undefined,
      secret: SECRET,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Missing x-hub-signature header',
    });
  });

  it('rejects when signature header is empty', () => {
    const result = verifyFirefliesWebhookSignature({
      rawBody: '{}',
      signatureHeader: '',
      secret: SECRET,
    });

    expect(result).toEqual({
      valid: false,
      error: 'Missing x-hub-signature header',
    });
  });

  it('rejects when the signature was computed from a different body', () => {
    const signature = sign(JSON.stringify({ meetingId: 'm1' }));

    const result = verifyFirefliesWebhookSignature({
      rawBody: JSON.stringify({ meetingId: 'tampered' }),
      signatureHeader: signature,
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });

  it('rejects when the signature was computed with a different secret', () => {
    const body = JSON.stringify({ meetingId: 'm1' });
    const signature = createHmac('sha256', 'other-secret')
      .update(body, 'utf8')
      .digest('hex');

    const result = verifyFirefliesWebhookSignature({
      rawBody: body,
      signatureHeader: signature,
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });

  it('rejects malformed signature strings', () => {
    const result = verifyFirefliesWebhookSignature({
      rawBody: '{}',
      signatureHeader: 'not-a-real-signature',
      secret: SECRET,
    });

    expect(result.valid).toBe(false);
  });
});
