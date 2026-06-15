import { createHmac, timingSafeEqual } from 'crypto';

export const SYNC_SIGNATURE_HEADER = 'x-sync-signature';

export function signPayload(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

export function verifySignature(body: string, secret: string, signature: string): boolean {
  if (!signature) return false;
  const expected = signPayload(body, secret);
  // Buffer.from(_, 'hex') silently truncates at the first non-hex char, so a valid prefix
  // followed by garbage could otherwise decode to a matching buffer. Require an exact,
  // fully-hex signature of the expected length before the constant-time compare.
  if (signature.length !== expected.length || !/^[0-9a-f]+$/i.test(signature)) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}
