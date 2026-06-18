// Client for the Social Posting Calendar composer's "Make a branded card"
// affordance (S-AI-Branded-Card).
//
// DETERMINISTIC, NOT generative: takes a REAL listing photo already attached to the
// post + the attached listing's id, and asks the CRM route to composite a "Just
// Listed" branded card (real photo + real facts + RE/MAX Hub branding) via the
// image-service sidecar. The route returns a stored { url } we attach as a new media
// tile — identical shape to /marketing/media/upload + /marketing/social/ai-image, so
// the composer reuses its media-attach flow.
//
// The route reads event.body, so the payload is wrapped as { body: {...} } — the
// same convention savePost / uploadMedia / aiCopy / generateImage use.

import { callPropelRoute } from '@/propel/lib/callPropelRoute';

const ROUTE = '/marketing/social/brand-card';

// Known error codes from the route (mirrors marketing-io envelopes). Unknown codes
// fall through to a generic message but are never swallowed.
const BRAND_CARD_ERROR_FALLBACK: Record<string, string> = {
  ENV_MISSING: 'Branded cards are not configured on this environment.',
  MEDIA_REQUIRED: 'A property photo is required to make a branded card.',
  MEDIA_UPLOAD_FAILED: "The card couldn't be made or stored — try again.",
  TEMPLATE_INVALID: 'That photo could not be used — try another one.',
  NOT_FOUND: 'Attach a LIVE listing first — branded cards use its real details.',
};

export type BrandCardOutcome =
  | { ok: true; url: string }
  | { ok: false; message: string; operatorAction: string | null };

// Plain boolean (NOT a type predicate): the success/error response shapes share
// optional fields, so a predicate would mis-narrow. The success check re-validates.
const isEnvelopeError = (res: unknown): boolean =>
  typeof res === 'object' &&
  res !== null &&
  (res as { ok?: unknown }).ok !== true &&
  typeof (res as { code?: unknown }).code === 'string';

const networkFail = (): BrandCardOutcome => ({
  ok: false,
  message: "Couldn't reach the card service. Check your connection and try again.",
  operatorAction: null,
});

const envelopeFail = (res: {
  error?: string;
  code?: string;
  operatorAction?: string;
}): BrandCardOutcome => {
  const code = res.code ?? 'UNKNOWN';
  const message =
    (typeof res.error === 'string' && res.error) ||
    BRAND_CARD_ERROR_FALLBACK[code] ||
    'Something went wrong making the branded card.';
  return { ok: false, message, operatorAction: res.operatorAction ?? null };
};

// Fetch an already-uploaded photo's bytes from its (signed) public URL and return
// bare base64 + content-type. The composer only retains the public URL of a ready
// media tile (not the original File), so we re-read the bytes here to hand them to
// the route. Returns null on any fetch/read failure (the caller surfaces a clear
// error). Guards an over-large fetch with the same 7 MB transport cap the route
// enforces, so we never base64-inflate a huge blob into a doomed request.
const MAX_SOURCE_BYTES = 7 * 1024 * 1024;

export const fetchPhotoBytes = async (
  url: string,
): Promise<{ base64: string; contentType: string } | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size === 0 || blob.size > MAX_SOURCE_BYTES) return null;
    const contentType = blob.type || 'image/jpeg';
    const base64 = await blobToBase64(blob);
    return base64 === null ? null : { base64, contentType };
  } catch {
    return null;
  }
};

const blobToBase64 = (blob: Blob): Promise<string | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        resolve(null);
        return;
      }
      // result is a data: URL; strip the prefix to a bare base64 string.
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });

// Make a branded card from an attached listing + a source photo (bytes). One card
// per call. The route re-resolves the listing facts server-side, so the caller only
// supplies the listingId + the photo bytes.
export const makeBrandCard = async (args: {
  listingId: string;
  imageBytes: string;
  contentType: string;
}): Promise<BrandCardOutcome> => {
  const res = await callPropelRoute<{
    ok?: boolean;
    url?: string;
    error?: string;
    code?: string;
    operatorAction?: string;
  }>(ROUTE, {
    body: {
      listingId: args.listingId,
      imageBytes: args.imageBytes,
      contentType: args.contentType,
    },
  });
  if (res === null) return networkFail();
  if (isEnvelopeError(res)) return envelopeFail(res);
  if (res.ok === true && typeof res.url === 'string') return { ok: true, url: res.url };
  return {
    ok: false,
    message: 'Something went wrong making the branded card.',
    operatorAction: null,
  };
};
