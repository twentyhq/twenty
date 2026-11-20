import * as crypto from 'node:crypto';

export const validateWebhookPayload = (
  sha256_signature: string | null,
  payload: string,
  app_secret: string,
): boolean => {
  // https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
  const webhookSignature = sha256_signature?.replace('sha256=', '').trim();
  if (webhookSignature === undefined) {
    return false;
  }

  const generatedHash = crypto
    .createHmac('sha256', app_secret)
    .update(payload)
    .digest('hex');

  const webhookSignatureBuffer = Buffer.from(webhookSignature, 'utf8');
  const generatedHashBuffer = Buffer.from(generatedHash, 'utf8');

  return (
    webhookSignatureBuffer.length === generatedHashBuffer.length &&
    crypto.timingSafeEqual(webhookSignatureBuffer, generatedHashBuffer)
  );
};
