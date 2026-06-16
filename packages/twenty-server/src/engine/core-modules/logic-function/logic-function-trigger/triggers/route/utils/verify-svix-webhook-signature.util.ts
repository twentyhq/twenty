import { createHmac, timingSafeEqual } from 'crypto';

import { isUndefined } from '@sniptt/guards';

const SVIX_WEBHOOK_SECRET_PREFIX = 'whsec_';
const SVIX_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export const verifySvixWebhookSignature = ({
  rawBody,
  headers,
  secret,
  now = new Date(),
}: {
  rawBody: string;
  headers: Record<string, string | undefined>;
  secret: string;
  now?: Date;
}): { valid: true } | { valid: false; error: string } => {
  if (!secret.startsWith(SVIX_WEBHOOK_SECRET_PREFIX)) {
    return {
      valid: false,
      error: 'Webhook secret must start with whsec_',
    };
  }

  const webhookId = headers['webhook-id'] ?? headers['svix-id'];
  const webhookTimestamp =
    headers['webhook-timestamp'] ?? headers['svix-timestamp'];
  const webhookSignature =
    headers['webhook-signature'] ?? headers['svix-signature'];

  if (
    isUndefined(webhookId) ||
    isUndefined(webhookTimestamp) ||
    isUndefined(webhookSignature)
  ) {
    return {
      valid: false,
      error: 'Missing webhook signature headers',
    };
  }

  const webhookTimestampSeconds = Number(webhookTimestamp);

  if (!Number.isInteger(webhookTimestampSeconds)) {
    return {
      valid: false,
      error: 'Invalid webhook timestamp',
    };
  }

  const nowSeconds = Math.floor(now.getTime() / 1000);

  if (
    Math.abs(nowSeconds - webhookTimestampSeconds) >
    SVIX_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS
  ) {
    return {
      valid: false,
      error: 'Webhook timestamp is outside of the allowed tolerance',
    };
  }

  const secretBytes = Buffer.from(
    secret.slice(SVIX_WEBHOOK_SECRET_PREFIX.length),
    'base64',
  );
  const expectedSignature = createHmac('sha256', secretBytes)
    .update(`${webhookId}.${webhookTimestamp}.${rawBody}`)
    .digest('base64');
  const providedSignatures = webhookSignature
    .split(' ')
    .map((signaturePart) => signaturePart.trim())
    .filter((signaturePart) => signaturePart !== '')
    .flatMap((signaturePart) => {
      if (signaturePart.startsWith('v1,') || signaturePart.startsWith('v1=')) {
        return [signaturePart.slice(3).trim()];
      }

      return [];
    })
    .filter((signaturePart) => signaturePart !== '');

  if (providedSignatures.length === 0) {
    return {
      valid: false,
      error: 'Missing v1 signature',
    };
  }

  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'base64');

  for (const providedSignature of providedSignatures) {
    const providedSignatureBuffer = Buffer.from(providedSignature, 'base64');

    if (providedSignatureBuffer.length !== expectedSignatureBuffer.length) {
      continue;
    }

    if (timingSafeEqual(providedSignatureBuffer, expectedSignatureBuffer)) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    error: 'Signature verification failed',
  };
};
