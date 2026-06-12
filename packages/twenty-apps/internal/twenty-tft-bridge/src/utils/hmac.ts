import { createHmac, timingSafeEqual } from 'crypto';

export const SYNC_SIGNATURE_HEADER = 'x-sync-signature';

export function signPayload(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

export function verifySignature(body: string, secret: string, signature: string): boolean {
  if (!signature) return false;
  const expected = signPayload(body, secret);
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}
