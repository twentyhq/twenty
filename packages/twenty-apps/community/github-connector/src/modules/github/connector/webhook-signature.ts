import { createHmac, timingSafeEqual } from 'crypto';

export type SignatureVerificationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function getRawBodyForSignature(event: {
  body: unknown;
  isBase64Encoded?: boolean;
  rawBody?: string;
}): string | null {
  if (typeof event.rawBody === 'string') {
    return event.rawBody;
  }
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
