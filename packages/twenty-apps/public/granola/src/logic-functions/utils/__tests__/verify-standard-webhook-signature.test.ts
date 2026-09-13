import { describe, expect, it } from 'vitest';

import { verifyStandardWebhookSignature } from 'src/logic-functions/utils/verify-standard-webhook-signature.util';

const SIGNED_DELIVERY = {
  signingSecret: 'whsec_MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=',
  webhookId: 'evt_123',
  timestamp: '1788566400',
  signature: 'v1,I69TZ8seQwYgHkoZm8BOY6Y4t1ndllzqrjq8ARHdk8I=',
  rawBody: '{"note_id":"not_12345678901234"}',
  receivedAt: 1788566400000,
};

describe('verifyStandardWebhookSignature', () => {
  it('verifies an independently computed HMAC vector', () => {
    expect(verifyStandardWebhookSignature(SIGNED_DELIVERY)).toBe(true);
  });

  it('accepts one matching signature among rotated signatures', () => {
    expect(
      verifyStandardWebhookSignature({
        ...SIGNED_DELIVERY,
        signature: `v1,aW52YWxpZA== ${SIGNED_DELIVERY.signature}`,
      }),
    ).toBe(true);
  });

  it.each([
    { rawBody: '{"note_id":"not_00000000000000"}' },
    { webhookId: 'evt_other' },
    { signingSecret: 'whsec_d3Jvbmc=' },
    { signature: 'v2,I69TZ8seQwYgHkoZm8BOY6Y4t1ndllzqrjq8ARHdk8I=' },
    { timestamp: '1788566400.0' },
    { receivedAt: 1788566701000 },
    { receivedAt: 1788566099000 },
    { receivedAt: Number.NaN },
  ])('rejects tampering or invalid freshness: %j', (overrides) => {
    expect(
      verifyStandardWebhookSignature({ ...SIGNED_DELIVERY, ...overrides }),
    ).toBe(false);
  });

  it('measures freshness at server receipt, independent of worker execution time', () => {
    expect(
      verifyStandardWebhookSignature({
        ...SIGNED_DELIVERY,
        receivedAt: 1788566699000,
      }),
    ).toBe(true);
  });
});
