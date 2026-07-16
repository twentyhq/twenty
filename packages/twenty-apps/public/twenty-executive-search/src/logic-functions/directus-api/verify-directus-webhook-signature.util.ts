import { createHmac, timingSafeEqual } from 'crypto';

import { isUndefined } from '@sniptt/guards';

const DIRECTUS_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export const verifyDirectusWebhookSignature = ({
  rawBody,
  signature,
  timestamp,
  secret,
  now = new Date(),
}: {
  rawBody: string;
  signature: string;
  timestamp: string;
  secret: string;
  now?: Date;
}): { valid: true } | { valid: false; error: string } => {
  if (!isUndefined(now)) {
    const timestampSeconds = Number(timestamp);

    if (!Number.isInteger(timestampSeconds)) {
      return {
        valid: false,
        error: 'Invalid webhook timestamp',
      };
    }

    const nowSeconds = Math.floor(now.getTime() / 1000);

    if (
      Math.abs(nowSeconds - timestampSeconds) >
      DIRECTUS_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS
    ) {
      return {
        valid: false,
        error: 'Webhook timestamp is outside of the allowed tolerance',
      };
    }
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('base64');

  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  const providedSignatureBuffer = Buffer.from(signature);

  if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
    return {
      valid: false,
      error: 'Signature verification failed',
    };
  }

  if (timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Signature verification failed',
  };
};
