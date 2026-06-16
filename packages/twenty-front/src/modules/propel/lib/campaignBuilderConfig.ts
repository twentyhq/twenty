import {
  type MergeField,
  type MergeValues,
} from '@/propel/lib/campaignRenderer';
import {
  type RouteEnvelopeError,
  type SegmentCriteriaV2,
} from '@/propel/types/campaignBuilder';

// Constants + pure helpers shared across the builder steps — ported from the
// Propel in-sandbox builder (marketing-cloud.tsx) so behaviour matches 1:1.

// A single-message SEGMENT email send fills exactly ONE per-recipient field:
// firstName. Saved-snippet custom keys also always fill (fixed workspace value),
// so they widen the allow-set. A LISTING promo widens it further with the
// listing fields (only fillable once a listing is actually attached).
export const BUILDER_MERGE_FIELDS: MergeField[] = ['firstName'];
export const LISTING_MERGE_FIELDS: MergeField[] = [
  'listingTitle',
  'permitNumber',
];

// Live-preview sample values (the body/subject preview substitutes these).
export const PREVIEW_SAMPLES: MergeValues = { firstName: 'Aisha' };

export const listingPreviewSamples = (
  listingName: string | null,
): MergeValues => ({
  listingTitle: listingName ?? 'Marina Gate · 2BR',
  permitNumber: 'P-DLD-00000',
});

// The format toolbar above the email body: wrap selection with before/after.
export interface FormatAction {
  label: string;
  title: string;
  before: string;
  placeholder: string;
  after: string;
}

export const FORMAT_ACTIONS: FormatAction[] = [
  { label: 'H', title: 'Heading', before: '## ', placeholder: 'Heading', after: '' },
  { label: 'B', title: 'Bold', before: '**', placeholder: 'bold text', after: '**' },
  { label: 'I', title: 'Italic', before: '*', placeholder: 'italic text', after: '*' },
  { label: '• List', title: 'Bullet item', before: '- ', placeholder: 'List item', after: '' },
  { label: 'Link', title: 'Link', before: '[', placeholder: 'link text', after: '](https://)' },
  {
    label: 'Button',
    title: 'Call-to-action button',
    before: '[[',
    placeholder: 'Button label',
    after: ']](https://)',
  },
];

// Lead-source choices for the criteria segment builder (the most common axes;
// the resolver accepts any string, this is just the curated picker set).
export const LEAD_SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'META', label: 'Meta (FB / IG)' },
  { value: 'PROPERTY_FINDER', label: 'Property Finder' },
  { value: 'BAYUT', label: 'Bayut' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'WALK_IN', label: 'Walk-in' },
  { value: 'OTHER', label: 'Other' },
];

// 7 MB transport cap (mirrors marketing-media.MEDIA_MAX_DECODED_BYTES) — the
// route also enforces it; we surface a friendly message before the round-trip.
export const MEDIA_MAX_DECODED_BYTES = 7 * 1024 * 1024;

// Dubai-local "YYYY-MM-DDTHH:mm" (from a datetime-local input) → an absolute UTC
// ISO string anchored to Asia/Dubai (+04:00, no DST). Returns null on a malformed
// value so the caller can show "pick a date & time first".
export const dubaiLocalToIso = (value: string): string | null => {
  const m = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.exec(value);
  if (!m) return null;
  const t = Date.parse(`${value}${m[1] ? '' : ':00'}+04:00`);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
};

// Read a native File's bytes and base64-encode them for the import-segment
// route's contentBase64 field. In the REAL frontend we have File.arrayBuffer()
// directly (the sandbox had to round-trip through readFrontComponentFile), so
// this is the graduated equivalent of that flow.
export const fileToBase64 = async (file: File): Promise<string> => {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const CHUNK = 0x8000; // 32k — avoids "max call stack" on String.fromCharCode.apply
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
};

// Pull the operator-facing message out of a typed route envelope: prefer the
// plain-language operatorAction, fall back to error, then a generic default.
export const envelopeMessage = (
  res: RouteEnvelopeError | null,
  fallback: string,
): string => res?.operatorAction || res?.error || fallback;

// Build a v2 criteria object from the criteria-builder fields, omitting empty
// axes (the resolver treats an absent axis as "no restriction").
export const buildCriteriaV2 = (args: {
  sources: string[];
  coldDays: string;
}): SegmentCriteriaV2 => {
  const criteria: SegmentCriteriaV2 = { version: 2 };
  if (args.sources.length > 0) criteria.sources = args.sources;
  const cold = Number.parseInt(args.coldDays, 10);
  if (Number.isFinite(cold) && cold > 0) criteria.lastTouchOlderThanDays = cold;
  return criteria;
};

// AI text/plan coercion (the ai-build route only JSON-parses/casts the LLM
// output — a non-string field would crash render/.slice/save).
export const aiText = (x: unknown): string =>
  typeof x === 'string' ? x : '';
