import { createHmac, timingSafeEqual } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { UNIPILE_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS } from 'src/unipile/constants/unipile-webhook-signature-tolerance-seconds.constant';

const parseSignatureHeader = (
  signatureHeader: string,
): { timestamp: string | undefined; signature: string | undefined } => {
  const parts = new Map(
    signatureHeader.split(',').map((part) => {
      const separatorIndex = part.indexOf('=');

      return [
        part.slice(0, separatorIndex).trim(),
        part.slice(separatorIndex + 1).trim(),
      ];
    }),
  );

  return { timestamp: parts.get('t'), signature: parts.get('v0') };
};

export const verifyUnipileWebhookSignature = ({
  signatureHeader,
  rawBody,
  secret,
  nowInSeconds = Math.floor(Date.now() / 1000),
}: {
  signatureHeader: string | undefined;
  rawBody: string | undefined;
  secret: string;
  nowInSeconds?: number;
}): boolean => {
  if (!isNonEmptyString(signatureHeader) || rawBody === undefined) {
    return false;
  }

  const { timestamp, signature } = parseSignatureHeader(signatureHeader);

  if (!isNonEmptyString(timestamp) || !isNonEmptyString(signature)) {
    return false;
  }

  const timestampInSeconds = Number(timestamp);

  if (
    !Number.isFinite(timestampInSeconds) ||
    Math.abs(nowInSeconds - timestampInSeconds) >
      UNIPILE_WEBHOOK_SIGNATURE_TOLERANCE_SECONDS
  ) {
    return false;
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest();
  const received = Buffer.from(signature, 'hex');

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
};
