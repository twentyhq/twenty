import * as crypto from 'node:crypto';

// https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
export const validateWebhookPayload = ({
  signature,
  payload,
  appSecret,
}: {
  signature: string;
  payload: string;
  appSecret: string;
}): boolean => {
  const receivedHash = Buffer.from(signature.replace('sha256=', '').trim(), 'utf8');
  const expectedHash = Buffer.from(
    crypto.createHmac('sha256', appSecret).update(payload).digest('hex'),
    'utf8',
  );

  return (
    receivedHash.length === expectedHash.length &&
    crypto.timingSafeEqual(receivedHash, expectedHash)
  );
};
