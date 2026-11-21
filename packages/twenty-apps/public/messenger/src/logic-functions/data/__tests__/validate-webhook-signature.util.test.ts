import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { validateWebhookSignature } from 'src/logic-functions/data/validate-webhook-signature.util';

const APP_SECRET = 'app-secret';
const PAYLOAD = '{"object":"page","entry":[]}';
const SIGNATURE = `sha256=${createHmac('sha256', APP_SECRET).update(PAYLOAD).digest('hex')}`;

describe('validateWebhookSignature', () => {
  it('accepts a payload signed with the app secret', () => {
    expect(
      validateWebhookSignature({
        signature: SIGNATURE,
        payload: PAYLOAD,
        appSecret: APP_SECRET,
      }),
    ).toBe(true);
  });

  it('rejects a tampered payload', () => {
    expect(
      validateWebhookSignature({
        signature: SIGNATURE,
        payload: PAYLOAD.replace('page', 'user'),
        appSecret: APP_SECRET,
      }),
    ).toBe(false);
  });

  it('rejects a signature made with another secret', () => {
    expect(
      validateWebhookSignature({
        signature: SIGNATURE,
        payload: PAYLOAD,
        appSecret: 'other-secret',
      }),
    ).toBe(false);
  });

  it('rejects a malformed signature', () => {
    expect(
      validateWebhookSignature({
        signature: 'sha256=abc',
        payload: PAYLOAD,
        appSecret: APP_SECRET,
      }),
    ).toBe(false);
  });
});
