import { createHmac } from 'crypto';

/**
 * Symmetric outbound HMAC-SHA256 signer.
 *
 * Signs `<timestamp>.<body>` with the shared webhook secret so the
 * Directus endpoint can verify the payload came from this app.
 */
export const signDirectusProjection = ({
  body,
  secret,
  now = new Date(),
}: {
  body: string;
  secret: string;
  now?: Date;
}): { timestamp: string; signature: string } => {
  const timestamp = String(Math.floor(now.getTime() / 1000));
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('base64');

  return { timestamp, signature };
};
