import { createHmac, timingSafeEqual } from 'crypto';

export type SignatureVerificationResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Returns the original raw request body (as bytes / utf-8 string) used by
 * GitHub to compute the `X-Hub-Signature-256` HMAC.
 *
 * The Twenty SDK exposes `event.body` as either:
 *   - the original string (when `isBase64Encoded` is true, base64-encoded),
 *   - the raw text (when the route was triggered with a non-JSON body), or
 *   - an already-parsed JSON object.
 *
 * For the third case we cannot reconstruct the bytes GitHub signed (key
 * order, whitespace and unicode escaping all matter), so we return `null`
 * and let the caller decide. We deliberately do NOT `JSON.stringify` the
 * parsed body — that would produce a signature mismatch on every delivery
 * and silently drop valid webhooks.
 */
export function getRawBodyForSignature(event: {
  body: unknown;
  isBase64Encoded?: boolean;
}): string | null {
  const raw = event.body;
  if (raw == null) return '';
  if (typeof raw === 'string') {
    return event.isBase64Encoded
      ? Buffer.from(raw, 'base64').toString('utf8')
      : raw;
  }
  return null;
}

export function verifyGitHubSignature({
  rawBody,
  signatureHeader,
  secret,
}: {
  rawBody: string | null;
  signatureHeader: string | undefined;
  secret: string;
}): SignatureVerificationResult {
  if (rawBody === null) {
    return {
      ok: false,
      reason:
        'raw request body is unavailable (the runtime parsed it as JSON); HMAC cannot be verified',
    };
  }
  if (!signatureHeader) {
    return { ok: false, reason: 'missing X-Hub-Signature-256 header' };
  }
  const prefix = 'sha256=';
  if (!signatureHeader.startsWith(prefix)) {
    return { ok: false, reason: 'malformed signature header' };
  }
  const provided = signatureHeader.slice(prefix.length);
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (provided.length !== expected.length) {
    return { ok: false, reason: 'signature length mismatch' };
  }
  const ok = timingSafeEqual(
    Buffer.from(provided, 'utf8'),
    Buffer.from(expected, 'utf8'),
  );
  return ok ? { ok: true } : { ok: false, reason: 'signature mismatch' };
}
