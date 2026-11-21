import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { validateWebhookSignature } from 'src/logic-functions/data/validate-webhook-signature.util';

const CHANNEL_SECRET = 'channel-secret';
const PAYLOAD = '{"destination":"U0123","events":[{"type":"message","text":"こんにちは"}]}';
const SIGNATURE = createHmac('sha256', CHANNEL_SECRET)
  .update(PAYLOAD)
  .digest('base64');

describe('validateWebhookSignature', () => {
  it('accepts a payload signed with the channel secret', () => {
    expect(
      validateWebhookSignature({
        signature: SIGNATURE,
        payload: PAYLOAD,
        channelSecret: CHANNEL_SECRET,
      }),
    ).toBe(true);
  });

  it('rejects a tampered payload', () => {
    expect(
      validateWebhookSignature({
        signature: SIGNATURE,
        payload: PAYLOAD.replace('U0123', 'U9999'),
        channelSecret: CHANNEL_SECRET,
      }),
    ).toBe(false);
  });

  it('rejects a signature made with another secret', () => {
    expect(
      validateWebhookSignature({
        signature: SIGNATURE,
        payload: PAYLOAD,
        channelSecret: 'other-secret',
      }),
    ).toBe(false);
  });

  it('rejects a hex signature of the right payload', () => {
    expect(
      validateWebhookSignature({
        signature: createHmac('sha256', CHANNEL_SECRET)
          .update(PAYLOAD)
          .digest('hex'),
        payload: PAYLOAD,
        channelSecret: CHANNEL_SECRET,
      }),
    ).toBe(false);
  });
});
