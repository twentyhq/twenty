import { createHmac, timingSafeEqual } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

const SIGNATURE_VERSION = 'v0';
const MAX_TIMESTAMP_AGE_SECONDS = 60 * 5;

export const verifySlackRequestSignature = ({
  rawBody,
  signatureHeader,
  timestampHeader,
  secret,
  nowInSeconds = Math.floor(Date.now() / 1000),
}: {
  rawBody: string;
  signatureHeader: string | undefined;
  timestampHeader: string | undefined;
  secret: string;
  nowInSeconds?: number;
}): { valid: true } | { valid: false; error: string } => {
  if (!isNonEmptyString(signatureHeader)) {
    return { valid: false, error: 'Missing x-slack-signature header' };
  }

  if (!isNonEmptyString(timestampHeader)) {
    return { valid: false, error: 'Missing x-slack-request-timestamp header' };
  }

  const timestamp = Number.parseInt(timestampHeader, 10);

  if (Number.isNaN(timestamp)) {
    return { valid: false, error: 'Malformed x-slack-request-timestamp' };
  }

  if (Math.abs(nowInSeconds - timestamp) > MAX_TIMESTAMP_AGE_SECONDS) {
    return { valid: false, error: 'Request timestamp is too old' };
  }

  const baseString = `${SIGNATURE_VERSION}:${timestampHeader}:${rawBody}`;
  const expected = `${SIGNATURE_VERSION}=${createHmac('sha256', secret)
    .update(baseString, 'utf8')
    .digest('hex')}`;

  const providedBuffer = Buffer.from(signatureHeader.trim(), 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  if (providedBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: 'Signature length mismatch' };
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return { valid: false, error: 'Signature verification failed' };
  }

  return { valid: true };
};
