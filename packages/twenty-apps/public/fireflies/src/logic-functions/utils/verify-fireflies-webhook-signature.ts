import { createHmac, timingSafeEqual } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

const SIGNATURE_PREFIX = 'sha256=';

const stripPrefix = (signature: string): string =>
  signature.startsWith(SIGNATURE_PREFIX)
    ? signature.slice(SIGNATURE_PREFIX.length)
    : signature;

export const verifyFirefliesWebhookSignature = ({
  rawBody,
  signatureHeader,
  secret,
}: {
  rawBody: string;
  signatureHeader: string | undefined;
  secret: string;
}): { valid: true } | { valid: false; error: string } => {
  if (!isNonEmptyString(signatureHeader)) {
    return { valid: false, error: 'Missing x-hub-signature header' };
  }

  const provided = stripPrefix(signatureHeader.trim()).toLowerCase();
  const expected = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  if (provided.length !== expected.length) {
    return { valid: false, error: 'Signature length mismatch' };
  }

  const providedBuffer = Buffer.from(provided, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (
    providedBuffer.length === 0 ||
    providedBuffer.length !== expectedBuffer.length
  ) {
    return { valid: false, error: 'Malformed signature' };
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return { valid: false, error: 'Signature verification failed' };
  }

  return { valid: true };
};
