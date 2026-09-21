import { createHmac } from 'crypto';

import { describe, expect, it } from 'vitest';

import { verifySlackRequestSignature } from 'src/logic-functions/utils/verify-slack-request-signature';

const SECRET = 'test-signing-secret';
const RAW_BODY = '{"type":"event_callback","event_id":"Ev123"}';
const TIMESTAMP = '1700000000';
const NOW_IN_SECONDS = 1700000010;

const signRequest = (rawBody: string, timestamp: string, secret: string) =>
  `v0=${createHmac('sha256', secret)
    .update(`v0:${timestamp}:${rawBody}`, 'utf8')
    .digest('hex')}`;

describe('verifySlackRequestSignature', () => {
  it('should accept a request signed with the shared secret', () => {
    expect(
      verifySlackRequestSignature({
        rawBody: RAW_BODY,
        signatureHeader: signRequest(RAW_BODY, TIMESTAMP, SECRET),
        timestampHeader: TIMESTAMP,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(true);
  });

  it('should reject a signature computed with another secret', () => {
    expect(
      verifySlackRequestSignature({
        rawBody: RAW_BODY,
        signatureHeader: signRequest(RAW_BODY, TIMESTAMP, 'wrong-secret'),
        timestampHeader: TIMESTAMP,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(false);
  });

  it('should reject a tampered body', () => {
    expect(
      verifySlackRequestSignature({
        rawBody: RAW_BODY.replace('Ev123', 'Ev999'),
        signatureHeader: signRequest(RAW_BODY, TIMESTAMP, SECRET),
        timestampHeader: TIMESTAMP,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(false);
  });

  it('should reject a stale timestamp to prevent replays', () => {
    expect(
      verifySlackRequestSignature({
        rawBody: RAW_BODY,
        signatureHeader: signRequest(RAW_BODY, TIMESTAMP, SECRET),
        timestampHeader: TIMESTAMP,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS + 60 * 10,
      }),
    ).toBe(false);
  });

  it('should reject when required headers are missing', () => {
    expect(
      verifySlackRequestSignature({
        rawBody: RAW_BODY,
        signatureHeader: undefined,
        timestampHeader: TIMESTAMP,
        secret: SECRET,
        nowInSeconds: NOW_IN_SECONDS,
      }),
    ).toBe(false);
  });
});
