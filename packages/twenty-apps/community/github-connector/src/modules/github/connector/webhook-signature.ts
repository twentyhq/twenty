import { createHmac, timingSafeEqual } from 'crypto';

export type SignatureVerificationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function getRawBodyForSignature(event: {
  body: unknown;
  isBase64Encoded?: boolean;
}): string {
  const raw = event.body;
  if (raw == null) return '';
  if (typeof raw === 'string') {
    return event.isBase64Encoded
      ? Buffer.from(raw, 'base64').toString('utf8')
      : raw;
  }
  return JSON.stringify(raw);
}

export function verifyGitHubSignature({
  rawBody,
  signatureHeader,
  secret,
}: {
  rawBody: string;
  signatureHeader: string | undefined;
  secret: string;
}): SignatureVerificationResult {
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
