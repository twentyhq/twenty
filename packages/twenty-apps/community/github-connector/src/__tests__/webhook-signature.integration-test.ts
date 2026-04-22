import { describe, expect, it } from 'vitest';
import { createHmac } from 'crypto';

import {
  getRawBodyForSignature,
  verifyGitHubSignature,
} from 'src/modules/github/connector/webhook-signature';

const SECRET = 'super-secret-shared-string';

function sign(body: string): string {
  return `sha256=${createHmac('sha256', SECRET).update(body).digest('hex')}`;
}

describe('verifyGitHubSignature', () => {
  it('accepts a valid signature', () => {
    const body = '{"action":"opened","number":42}';
    const result = verifyGitHubSignature({
      rawBody: body,
      signatureHeader: sign(body),
      secret: SECRET,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a tampered body', () => {
    const body = '{"action":"opened","number":42}';
    const signature = sign(body);
    const result = verifyGitHubSignature({
      rawBody: body.replace('42', '43'),
      signatureHeader: signature,
      secret: SECRET,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a wrong secret', () => {
    const body = '{"action":"opened","number":42}';
    const result = verifyGitHubSignature({
      rawBody: body,
      signatureHeader: sign(body),
      secret: 'other-secret',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a missing header', () => {
    const result = verifyGitHubSignature({
      rawBody: 'anything',
      signatureHeader: undefined,
      secret: SECRET,
    });
    expect(result).toMatchObject({
      ok: false,
      reason: 'missing X-Hub-Signature-256 header',
    });
  });

  it('rejects a header without sha256= prefix', () => {
    const result = verifyGitHubSignature({
      rawBody: 'anything',
      signatureHeader: 'sha1=deadbeef',
      secret: SECRET,
    });
    expect(result).toMatchObject({
      ok: false,
      reason: 'malformed signature header',
    });
  });

  it('rejects when length differs', () => {
    const result = verifyGitHubSignature({
      rawBody: 'anything',
      signatureHeader: 'sha256=tooshort',
      secret: SECRET,
    });
    expect(result).toMatchObject({
      ok: false,
      reason: 'signature length mismatch',
    });
  });
});

describe('getRawBodyForSignature', () => {
  it('returns the string as-is for string body', () => {
    expect(
      getRawBodyForSignature({ body: '{"a":1}', isBase64Encoded: false }),
    ).toBe('{"a":1}');
  });

  it('decodes base64 bodies', () => {
    const original = '{"a":1}';
    const b64 = Buffer.from(original, 'utf8').toString('base64');
    expect(getRawBodyForSignature({ body: b64, isBase64Encoded: true })).toBe(
      original,
    );
  });

  it('JSON-stringifies object bodies (parsed-by-runtime case)', () => {
    expect(getRawBodyForSignature({ body: { a: 1 } })).toBe('{"a":1}');
  });

  it('returns empty string for null/undefined', () => {
    expect(getRawBodyForSignature({ body: null })).toBe('');
  });
});
