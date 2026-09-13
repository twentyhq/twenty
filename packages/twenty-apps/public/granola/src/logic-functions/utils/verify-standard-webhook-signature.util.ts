import { createHmac, timingSafeEqual } from 'node:crypto';

const WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 300;

export const verifyStandardWebhookSignature = ({
  signingSecret,
  webhookId,
  timestamp,
  signature,
  rawBody,
  receivedAt,
}: {
  signingSecret: string;
  webhookId: string;
  timestamp: string;
  signature: string;
  rawBody: string;
  receivedAt: number;
}): boolean => {
  if (
    !/^\d+$/.test(timestamp) ||
    !Number.isFinite(receivedAt) ||
    Math.abs(receivedAt / 1000 - Number(timestamp)) >
      WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS ||
    !signingSecret.startsWith('whsec_')
  ) {
    return false;
  }
  const secret = Buffer.from(signingSecret.slice(6), 'base64');
  if (secret.length === 0) {
    return false;
  }
  const expectedSignature = createHmac('sha256', secret)
    .update(`${webhookId}.${timestamp}.${rawBody}`)
    .digest();
  return signature.split(/\s+/).some((candidate) => {
    if (!candidate.startsWith('v1,')) {
      return false;
    }
    const candidateSignature = Buffer.from(candidate.slice(3), 'base64');
    return (
      candidateSignature.length === expectedSignature.length &&
      timingSafeEqual(candidateSignature, expectedSignature)
    );
  });
};
