import { describe, it, expect } from 'vitest';
import { signPayload, verifySignature } from 'src/utils/hmac';

describe('signPayload', () => {
  it('produces a 64-char hex string', () => {
    const sig = signPayload('{"foo":"bar"}', 'secret');
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('same body + secret always gives same signature', () => {
    const a = signPayload('{"x":1}', 'mysecret');
    const b = signPayload('{"x":1}', 'mysecret');
    expect(a).toBe(b);
  });

  it('different body gives different signature', () => {
    const a = signPayload('{"x":1}', 'mysecret');
    const b = signPayload('{"x":2}', 'mysecret');
    expect(a).not.toBe(b);
  });
});

describe('verifySignature', () => {
  it('returns true for matching signature', () => {
    const body = '{"tftOpportunityId":"abc-123"}';
    const secret = 'test-secret';
    const sig = signPayload(body, secret);
    expect(verifySignature(body, secret, sig)).toBe(true);
  });

  it('returns false for tampered body', () => {
    const secret = 'test-secret';
    const sig = signPayload('original', secret);
    expect(verifySignature('tampered', secret, sig)).toBe(false);
  });

  it('returns false for empty signature', () => {
    expect(verifySignature('body', 'secret', '')).toBe(false);
  });

  it('returns false for wrong secret', () => {
    const body = 'payload';
    const sig = signPayload(body, 'correct-secret');
    expect(verifySignature(body, 'wrong-secret', sig)).toBe(false);
  });
});
