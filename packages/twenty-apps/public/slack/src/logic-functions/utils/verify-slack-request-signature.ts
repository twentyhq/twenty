import { createHmac, timingSafeEqual } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

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
}): boolean => {
  if (
    !isNonEmptyString(signatureHeader) ||
    !isNonEmptyString(timestampHeader)
  ) {
    return false;
  }

  const timestamp = Number.parseInt(timestampHeader, 10);

  if (
    Number.isNaN(timestamp) ||
    Math.abs(nowInSeconds - timestamp) > MAX_TIMESTAMP_AGE_SECONDS
  ) {
    return false;
  }

  const expected = `v0=${createHmac('sha256', secret)
    .update(`v0:${timestampHeader}:${rawBody}`, 'utf8')
    .digest('hex')}`;
  const providedBuffer = Buffer.from(signatureHeader.trim(), 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
};
