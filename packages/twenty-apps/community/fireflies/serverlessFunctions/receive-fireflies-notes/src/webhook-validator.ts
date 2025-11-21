import { createHash, createHmac } from 'crypto';
import type { FirefliesWebhookPayload } from './types';

export type SignatureVerificationResult = {
  isValid: boolean;
  computedSignature?: string;
};

export const verifyWebhookSignature = (
  body: string,
  signature: string | undefined,
  secret: string
): SignatureVerificationResult => {
  if (!signature) {
    return { isValid: false };
  }

  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(body, 'utf8');
    const computed = hmac.digest('hex');
    const computedSignature = `sha256=${computed}`;

    const isValid = signature === computedSignature;

    return { isValid, computedSignature };
  } catch {
    return { isValid: false };
  }
};

export const getWebhookSecretFingerprint = (secret: string): string => {
  return createHash('sha256').update(secret).digest('hex').substring(0, 8);
};

export const isValidFirefliesPayload = (
  params: unknown
): params is FirefliesWebhookPayload => {
  if (!params || typeof params !== 'object') {
    return false;
  }

  const payload = params as Record<string, unknown>;

  return (
    typeof payload['meetingId'] === 'string' &&
    payload['meetingId'].length > 0 &&
    typeof payload['eventType'] === 'string' &&
    payload['eventType'].length > 0 &&
    (payload['clientReferenceId'] === undefined ||
      typeof payload['clientReferenceId'] === 'string')
  );
};

