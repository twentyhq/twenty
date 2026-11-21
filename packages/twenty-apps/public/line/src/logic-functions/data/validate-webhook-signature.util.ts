import { createHmac, timingSafeEqual } from 'node:crypto';

// https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/
export const validateWebhookSignature = ({
  signature,
  payload,
  channelSecret,
}: {
  signature: string;
  payload: string;
  channelSecret: string;
}): boolean => {
  const receivedSignature = Buffer.from(signature.trim(), 'utf8');
  const expectedSignature = Buffer.from(
    createHmac('sha256', channelSecret).update(payload).digest('base64'),
    'utf8',
  );

  return (
    receivedSignature.length === expectedSignature.length &&
    timingSafeEqual(receivedSignature, expectedSignature)
  );
};
