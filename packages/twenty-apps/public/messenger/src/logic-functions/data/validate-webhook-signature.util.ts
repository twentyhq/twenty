import { createHmac, timingSafeEqual } from 'node:crypto';

// https://developers.facebook.com/docs/messenger-platform/webhooks#validate-payloads
export const validateWebhookSignature = ({
  signature,
  payload,
  appSecret,
}: {
  signature: string;
  payload: string;
  appSecret: string;
}): boolean => {
  const receivedHash = Buffer.from(
    signature.replace('sha256=', '').trim(),
    'utf8',
  );
  const expectedHash = Buffer.from(
    createHmac('sha256', appSecret).update(payload).digest('hex'),
    'utf8',
  );

  return (
    receivedHash.length === expectedHash.length &&
    timingSafeEqual(receivedHash, expectedHash)
  );
};
