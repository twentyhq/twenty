// Compose-surface logic for the Social Posting Calendar hero (S3).
//
// Owns the pure, testable pieces of the composer: per-network character limits,
// schedule presets, draft <-> form mapping, the save/upload route calls, and the
// server error-envelope mapping. The composer component (PostComposer.tsx) stays
// presentational and delegates all rules + I/O here.
//
// Contract notes (verified against the app routes in propel-crm-integration):
//   • POST /marketing/social/save-post reads `event.body`, so the request payload
//     MUST be wrapped as { body: {...} } — the same shape the in-sandbox composer
//     sends (marketing-cloud-social.tsx). The route returns either
//     { ok: true, postId, status } on success or an ERROR ENVELOPE
//     { error, code, context, correlationId, operatorAction? } with HTTP 200 — so
//     callPropelRoute (which returns the parsed body on 2xx) preserves the
//     envelope; we never lose COMPLIANCE_BLOCK / MEDIA_REQUIRED / TEMPLATE_INVALID
//     / ILLEGAL_TRANSITION.
//   • POST /marketing/media/upload reads `event.body` too:
//     { filename, contentType, contentBase64 } → { ok, url, contentType } or an
//     error envelope. In the REAL frontend (not the sandbox worker) we read file
//     bytes directly via FileReader, so there is no token-RPC indirection.

import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  type SocialNetwork,
  type SocialPost,
} from '@/propel/types/socialCalendar';

// Per-network copy limits (§11.2). One caption is shared across networks in v1;
// the counter blocks save only for a network that is BOTH selected AND over.
export const NETWORK_CHAR_LIMIT: Record<SocialNetwork, number> = {
  FACEBOOK: 63_000,
  INSTAGRAM: 2_200,
  LINKEDIN: 3_000,
  TIKTOK: 2_200,
};

// 7 MB per item — mirrors the server cap (marketing-media.ts MEDIA_MAX_DECODED_BYTES).
// Enforced client-side from file.size before we read bytes, and again server-side.
export const MEDIA_MAX_BYTES = 7 * 1024 * 1024;

export type ComposeMode = 'now' | 'schedule' | 'draft';

// The three save modes (§11.6). The primary button label tracks the mode.
export const MODE_LABEL: Record<ComposeMode, string> = {
  now: 'Post now',
  schedule: 'Schedule post',
  draft: 'Save draft',
};

// A media item in the carousel. Either an uploaded/pasted public URL (the only
// shape save-post accepts via imageUrls[]) or — while a local upload is in flight
// — a transient entry with no URL yet. `objectUrl` is a local preview blob URL
// (revoked on removal); `kind` drives the <img> vs <video> preview tag.
export type ComposerMedia = {
  /** stable id for list keys + reorder */
  id: string;
  /** the public URL sent to save-post; null while uploading or on error */
  url: string | null;
  /** local preview (blob: URL) shown until/while the public URL resolves */
  objectUrl: string | null;
  kind: 'image' | 'video';
  name: string;
  status: 'uploading' | 'ready' | 'error';
  /** inline error for this tile (e.g. too large / upload failed) */
  error: string | null;
};

const VIDEO_TYPE = /^video\//i;
const VIDEO_EXT = /\.(mp4|mov|webm|m4v|ogg)(\?|#|$)/i;

export const mediaKindOf = (
  contentType: string | null | undefined,
  url?: string | null,
): 'image' | 'video' => {
  if (typeof contentType === 'string' && VIDEO_TYPE.test(contentType))
    return 'video';
  if (typeof url === 'string' && VIDEO_EXT.test(url)) return 'video';
  return 'image';
};

// ── datetime-local <-> ISO ──────────────────────────────────────────────────
// <input type="datetime-local"> works in LOCAL time with no zone; we convert to
// an ISO instant for the route and back for editing, exactly like the in-sandbox
// composer's socialToLocalInput. An empty/invalid value yields '' (the field
// shows blank) rather than throwing.
export const isoToLocalInput = (iso: string | null): string => {
  if (iso === null || iso === '') return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // shift by the local tz offset so toISOString's slice reads local wall-clock
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export const localInputToIso = (value: string): string | null => {
  if (value === '') return null;
  const d = new Date(value); // datetime-local is parsed as local time
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

// ── schedule presets (§11.6) ────────────────────────────────────────────────
// Each preset returns the datetime-local string for the field. "Tomorrow 9 AM";
// "This weekend" = upcoming Saturday 10 AM; "Next Monday" = the next Monday 9 AM.
// All relative to `now` (injectable for testability).
export type SchedulePreset = {
  key: 'tomorrow' | 'weekend' | 'nextMonday';
  label: string;
};

export const SCHEDULE_PRESETS: SchedulePreset[] = [
  { key: 'tomorrow', label: 'Tomorrow 9 AM' },
  { key: 'weekend', label: 'This weekend' },
  { key: 'nextMonday', label: 'Next Mon' },
];

const atLocal = (d: Date, hours: number): Date => {
  const r = new Date(d);
  r.setHours(hours, 0, 0, 0);
  return r;
};

export const presetToLocalInput = (
  key: SchedulePreset['key'],
  now: Date = new Date(),
): string => {
  let target: Date;
  if (key === 'tomorrow') {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    target = atLocal(t, 9);
  } else if (key === 'weekend') {
    // upcoming Saturday (day 6); if today is Sat/Sun, the coming Saturday.
    const day = now.getDay();
    const delta = (6 - day + 7) % 7 || 7;
    const t = new Date(now);
    t.setDate(t.getDate() + delta);
    target = atLocal(t, 10);
  } else {
    // next Monday (day 1)
    const day = now.getDay();
    const delta = (1 - day + 7) % 7 || 7;
    const t = new Date(now);
    t.setDate(t.getDate() + delta);
    target = atLocal(t, 9);
  }
  return isoToLocalInput(target.toISOString());
};

// ── validation (§11.7 — the blocking-summary) ───────────────────────────────
// The composer collects everything that blocks save into a flat list of human
// strings; an empty list means save is allowed. This mirrors (and is the client
// pre-check for) the server's own gate — the server stays authoritative and may
// still return COMPLIANCE_BLOCK (permit) since the live permit isn't in the
// status payload.
export type ComposerFormState = {
  body: string;
  networks: SocialNetwork[];
  listingId: string | null;
  attestedNoProperty: boolean;
  media: ComposerMedia[];
  mode: ComposeMode;
  scheduledLocal: string; // datetime-local value (only used when mode==='schedule')
};

// The per-network counter rows shown under the textarea: limit + current over/near.
export type CounterRow = {
  network: SocialNetwork;
  count: number;
  limit: number;
  /** 'ok' | 'near' (>=90%) | 'over' */
  level: 'ok' | 'near' | 'over';
};

export const counterRows = (
  body: string,
  networks: SocialNetwork[],
): CounterRow[] => {
  const count = [...body].length; // count code points, not UTF-16 units
  return networks.map((network) => {
    const limit = NETWORK_CHAR_LIMIT[network];
    const ratio = limit > 0 ? count / limit : 0;
    const level: CounterRow['level'] =
      count > limit ? 'over' : ratio >= 0.9 ? 'near' : 'ok';
    return { network, count, limit, level };
  });
};

export const hasReadyMedia = (media: ComposerMedia[]): boolean =>
  media.some((m) => m.status === 'ready' && m.url !== null);

export const isUploadingMedia = (media: ComposerMedia[]): boolean =>
  media.some((m) => m.status === 'uploading');

// Returns the list of blocking reasons (empty = OK to save). Order matters: most
// fundamental first so the one-line summary reads sensibly.
export const validateForm = (form: ComposerFormState): string[] => {
  const reasons: string[] = [];
  if (form.body.trim().length === 0) reasons.push('Add some post copy.');
  if (form.networks.length === 0) reasons.push('Pick at least one channel.');

  // compliance: listing OR attestation (the permit itself is checked server-side)
  if (form.listingId === null && !form.attestedNoProperty) {
    reasons.push(
      'Attach a listing, or confirm this post does not advertise a specific property.',
    );
  }

  // Instagram needs an image (no text-only IG feed posts)
  if (form.networks.includes('INSTAGRAM') && !hasReadyMedia(form.media)) {
    reasons.push('Instagram needs at least one image.');
  }

  // over-limit on any SELECTED network blocks save
  for (const row of counterRows(form.body, form.networks)) {
    if (row.level === 'over') {
      reasons.push(
        `Copy is over the ${row.network.charAt(0) + row.network.slice(1).toLowerCase()} limit (${row.limit.toLocaleString()}).`,
      );
    }
  }

  if (form.mode === 'schedule' && form.scheduledLocal === '') {
    reasons.push('Pick a date and time to schedule.');
  }

  if (isUploadingMedia(form.media)) reasons.push('Wait for media to finish uploading.');

  return reasons;
};

// Map an existing post into initial form state (edit mode). Media that's already
// attached comes back as ready public URLs (or opaque ids we can't preview — we
// still keep them so an edit doesn't silently drop media). Returns the parsed
// initial state; the component owns it from there.
export const formFromPost = (
  post: SocialPost,
  parsedMediaUrls: { ref: string; url: string | null; isVideo: boolean }[],
): ComposerFormState => {
  const media: ComposerMedia[] = parsedMediaUrls.map((m, i) => ({
    id: `existing-${i}-${m.ref.slice(0, 12)}`,
    url: m.url ?? m.ref, // keep opaque ids so edit re-sends them via mediaRefs
    objectUrl: null,
    kind: m.isVideo ? 'video' : 'image',
    name: m.url !== null ? 'Attached media' : 'Attached media',
    status: 'ready',
    error: null,
  }));
  const mode: ComposeMode = post.status === 'SCHEDULED' ? 'schedule' : 'draft';
  return {
    body: post.body ?? '',
    networks: (post.networks ?? []).filter(
      (n): n is SocialNetwork => NETWORK_CHAR_LIMIT[n] !== undefined,
    ),
    listingId: post.listingId,
    attestedNoProperty: post.attestedNoProperty ?? false,
    media,
    mode,
    scheduledLocal: isoToLocalInput(post.scheduledAt),
  };
};

// ── server I/O ──────────────────────────────────────────────────────────────

// A normalized save outcome the component can branch on without knowing the wire
// shape. `ok` carries the new/updated id; otherwise an inline-renderable error.
export type SaveOutcome =
  | { ok: true; postId: string; status: string }
  | {
      ok: false;
      code: string;
      message: string;
      operatorAction: string | null;
    };

// Known error codes from save-post (mirrors the route's envelopes). Unknown codes
// fall through to a generic message but are never swallowed.
const SAVE_ERROR_FALLBACK: Record<string, string> = {
  COMPLIANCE_BLOCK: 'This post is blocked by a compliance check.',
  MEDIA_REQUIRED: 'This post needs media before it can be saved.',
  MEDIA_UPLOAD_FAILED: "One of the images couldn't be loaded.",
  TEMPLATE_INVALID: 'The post is missing required fields.',
  ILLEGAL_TRANSITION: 'This post can no longer be edited.',
  ENV_MISSING: 'Social posting is not configured on this environment.',
  NOT_FOUND: 'You do not have access to do that.',
};

const isErrorEnvelope = (
  res: unknown,
): res is { error?: string; code?: string; operatorAction?: string } =>
  typeof res === 'object' &&
  res !== null &&
  (res as { ok?: unknown }).ok !== true &&
  typeof (res as { code?: unknown }).code === 'string';

// Save (create when postId is absent, update when present). Surfaces the server's
// compliance/error envelope rather than swallowing it. A null response (network /
// non-2xx) maps to a generic, retryable error.
export const savePost = async (args: {
  postId?: string;
  body: string;
  networks: SocialNetwork[];
  imageUrls: string[];
  listingId: string | null;
  attestedNoProperty: boolean;
  scheduledAt: string | null;
}): Promise<SaveOutcome> => {
  const payload: Record<string, unknown> = {
    body: args.body.trim(),
    networks: args.networks,
    ...(args.postId ? { postId: args.postId } : {}),
    ...(args.imageUrls.length > 0 ? { imageUrls: args.imageUrls } : {}),
    ...(args.listingId !== null
      ? { listingId: args.listingId }
      : { attestedNoProperty: args.attestedNoProperty }),
    ...(args.scheduledAt !== null ? { scheduledAt: args.scheduledAt } : {}),
  };

  // The route reads event.body — wrap accordingly (same as the existing composer).
  const res = await callPropelRoute<unknown>('/marketing/social/save-post', {
    body: payload,
  });

  if (res === null) {
    return {
      ok: false,
      code: 'NETWORK',
      message: "Couldn't reach the server. Check your connection and try again.",
      operatorAction: null,
    };
  }

  if (isErrorEnvelope(res)) {
    const code = res.code ?? 'UNKNOWN';
    const message =
      (typeof res.error === 'string' && res.error) ||
      SAVE_ERROR_FALLBACK[code] ||
      'Something went wrong saving this post.';
    return {
      ok: false,
      code,
      message,
      operatorAction: res.operatorAction ?? null,
    };
  }

  const ok = res as { ok?: boolean; postId?: string; status?: string };
  if (ok.ok === true && typeof ok.postId === 'string') {
    return { ok: true, postId: ok.postId, status: ok.status ?? 'DRAFT' };
  }

  // Shouldn't happen (route always returns one of the above), but never throw.
  return {
    ok: false,
    code: 'UNKNOWN',
    message: 'Something went wrong saving this post.',
    operatorAction: null,
  };
};

// Upload a single file's bytes to /marketing/media/upload and resolve a public
// URL. In the real frontend we have the File directly (FileReader → base64). A
// null return means the upload failed; the caller surfaces it on the tile.
export type UploadOutcome =
  | { ok: true; url: string; contentType: string }
  | { ok: false; message: string };

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('unreadable'));
        return;
      }
      // result is a data: URL; strip the prefix to a bare base64 string (the
      // route accepts either, but bare keeps the payload smaller).
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });

export const uploadMedia = async (file: File): Promise<UploadOutcome> => {
  if (file.size > MEDIA_MAX_BYTES) {
    const maxMb = Math.floor(MEDIA_MAX_BYTES / (1024 * 1024));
    return {
      ok: false,
      message: `That file is too large (max ${maxMb} MB). Compress or resize it and try again.`,
    };
  }

  let contentBase64: string;
  try {
    contentBase64 = await fileToBase64(file);
  } catch {
    return { ok: false, message: "Couldn't read that file. Try another one." };
  }

  const res = await callPropelRoute<{
    ok?: boolean;
    url?: string;
    contentType?: string;
    error?: string;
    operatorAction?: string;
  }>('/marketing/media/upload', {
    body: {
      filename: file.name,
      contentType: file.type,
      contentBase64,
    },
  });

  if (res !== null && res.ok === true && typeof res.url === 'string') {
    return {
      ok: true,
      url: res.url,
      contentType: res.contentType ?? file.type,
    };
  }

  const message =
    (res && (res.operatorAction || res.error)) ||
    'Upload failed — try a different file.';
  return { ok: false, message };
};
