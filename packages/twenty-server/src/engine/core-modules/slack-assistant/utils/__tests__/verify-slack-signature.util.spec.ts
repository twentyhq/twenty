import { createHmac } from 'crypto';

import { verifySlackSignature } from 'src/engine/core-modules/slack-assistant/utils/verify-slack-signature.util';

const SIGNING_SECRET = 'test-signing-secret';

const signBody = (body: string, timestamp: string): string =>
  `v0=${createHmac('sha256', SIGNING_SECRET)
    .update(`v0:${timestamp}:${body}`)
    .digest('hex')}`;

describe('verifySlackSignature', () => {
  const body = JSON.stringify({ type: 'url_verification', challenge: 'abc' });
  const nowSeconds = 1_700_000_000;
  const now = () => nowSeconds * 1000;
  const timestamp = String(nowSeconds);

  it('accepts a correctly signed, in-window request', () => {
    expect(
      verifySlackSignature({
        body,
        signature: signBody(body, timestamp),
        timestamp,
        signingSecret: SIGNING_SECRET,
        now,
      }),
    ).toBe(true);
  });

  it('rejects a tampered body (signature no longer matches)', () => {
    expect(
      verifySlackSignature({
        body: `${body} tampered`,
        signature: signBody(body, timestamp),
        timestamp,
        signingSecret: SIGNING_SECRET,
        now,
      }),
    ).toBe(false);
  });

  it('rejects a signature computed with the wrong secret', () => {
    const wrongSignature = `v0=${createHmac('sha256', 'other-secret')
      .update(`v0:${timestamp}:${body}`)
      .digest('hex')}`;

    expect(
      verifySlackSignature({
        body,
        signature: wrongSignature,
        timestamp,
        signingSecret: SIGNING_SECRET,
        now,
      }),
    ).toBe(false);
  });

  it('rejects a replayed request outside the skew window', () => {
    const oldTimestamp = String(nowSeconds - 6 * 60);

    expect(
      verifySlackSignature({
        body,
        signature: signBody(body, oldTimestamp),
        timestamp: oldTimestamp,
        signingSecret: SIGNING_SECRET,
        now,
      }),
    ).toBe(false);
  });

  it('rejects a non-numeric timestamp', () => {
    expect(
      verifySlackSignature({
        body,
        signature: signBody(body, 'not-a-number'),
        timestamp: 'not-a-number',
        signingSecret: SIGNING_SECRET,
        now,
      }),
    ).toBe(false);
  });

  it('rejects a signature of a different length without throwing', () => {
    expect(
      verifySlackSignature({
        body,
        signature: 'v0=short',
        timestamp,
        signingSecret: SIGNING_SECRET,
        now,
      }),
    ).toBe(false);
  });
});
