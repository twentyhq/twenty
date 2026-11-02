import { createHmac } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { verifyUnipileWebhookSignature } from 'src/unipile/utils/verify-unipile-webhook-signature.util';

const SECRET = 'webhook-secret';
const RAW_BODY = '{"id":"evt_1","type":"message.new"}';
const NOW_IN_SECONDS = 1_800_000_000;

const sign = ({
  timestamp,
  rawBody = RAW_BODY,
  secret = SECRET,
}: {
  timestamp: number;
  rawBody?: string;
  secret?: string;
}) =>
  `t=${timestamp},v0=${createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')}`;

describe('verifyUnipileWebhookSignature', () => {
  it('accepts a delivery signed with the endpoint secret', () => {
    expect(
      verifyUnipileWebhookSignature({
        signatureHeader: sign({ timestamp: NOW_IN_SECONDS }),
        rawBody: RAW_BODY,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(true);
  });

  it('rejects a body that does not match the signature', () => {
    expect(
      verifyUnipileWebhookSignature({
        signatureHeader: sign({ timestamp: NOW_IN_SECONDS }),
        rawBody: '{"id":"evt_2"}',
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(false);
  });

  it('rejects a delivery signed with another secret', () => {
    expect(
      verifyUnipileWebhookSignature({
        signatureHeader: sign({
          timestamp: NOW_IN_SECONDS,
          secret: 'other-secret',
        }),
        rawBody: RAW_BODY,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(false);
  });

  it('rejects a replayed delivery outside the tolerance window', () => {
    expect(
      verifyUnipileWebhookSignature({
        signatureHeader: sign({ timestamp: NOW_IN_SECONDS - 600 }),
        rawBody: RAW_BODY,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(false);
  });

  it.each([undefined, '', 'v0=abc', 't=1800000000', 't=abc,v0=00'])(
    'rejects the malformed header %s',
    (signatureHeader) => {
      expect(
        verifyUnipileWebhookSignature({
          signatureHeader,
          rawBody: RAW_BODY,
          secret: SECRET,
          nowInSeconds: NOW_IN_SECONDS,
        }),
      ).toBe(false);
    },
  );

  it('rejects a delivery without a raw body', () => {
    expect(
      verifyUnipileWebhookSignature({
        signatureHeader: sign({ timestamp: NOW_IN_SECONDS }),
        rawBody: undefined,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(false);
  });
});
