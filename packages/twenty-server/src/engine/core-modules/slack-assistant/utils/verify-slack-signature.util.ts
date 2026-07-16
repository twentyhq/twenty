import { createHmac, timingSafeEqual } from 'crypto';

// Slack signs each request as `v0:{timestamp}:{rawBody}` with the app signing
// secret (HMAC-SHA256). See https://api.slack.com/authentication/verifying-requests-from-slack
const SLACK_SIGNATURE_VERSION = 'v0';
const DEFAULT_MAX_SKEW_SECONDS = 5 * 60;

export const verifySlackSignature = ({
  body,
  signature,
  timestamp,
  signingSecret,
  maxSkewSeconds = DEFAULT_MAX_SKEW_SECONDS,
  now = Date.now,
}: {
  body: string;
  signature: string;
  timestamp: string;
  signingSecret: string;
  maxSkewSeconds?: number;
  now?: () => number;
}): boolean => {
  const timestampSeconds = Number(timestamp);

  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const nowSeconds = Math.floor(now() / 1000);

  if (Math.abs(nowSeconds - timestampSeconds) > maxSkewSeconds) {
    return false;
  }

  const expectedSignature = `${SLACK_SIGNATURE_VERSION}=${createHmac(
    'sha256',
    signingSecret,
  )
    .update(`${SLACK_SIGNATURE_VERSION}:${timestamp}:${body}`)
    .digest('hex')}`;

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
};
