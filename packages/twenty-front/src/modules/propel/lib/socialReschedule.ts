// Reschedule / publish-now / delete logic for the Social Posting Calendar hero (S4).
//
// These are the calendar-side mutations that ride the SAME existing routes the
// composer uses (no new server route) — `/marketing/social/save-post` for a
// schedule change and `/marketing/social/delete-post` for removal. They are split
// out from the composer so the calendar drag handler and the detail-drawer footer
// share one tested implementation and one error-envelope mapping.
//
// ⚠️ save-post re-runs the FULL server-side gate on every edit — including the
// Trakheesi permit check for a listing-linked post. A reschedule can therefore
// legitimately fail with COMPLIANCE_BLOCK if the permit lapsed since the post was
// created. We deliberately reuse `savePost` (not a thinner call) so the server
// receives the post's listing/attestation context and can re-validate it; the
// envelope is surfaced, never swallowed (the drag handler reverts + toasts it).

import { parseMediaRefs } from '@/propel/lib/socialPostDetail';
import { type SaveOutcome, savePost } from '@/propel/lib/socialComposer';
import {
  callPropelRoute,
} from '@/propel/lib/callPropelRoute';
import {
  type SocialNetwork,
  type SocialPost,
} from '@/propel/types/socialCalendar';

// The minimal set of fields save-post needs to UPDATE an existing post without
// dropping anything it already has. The route reads each of these; omitting
// networks/body would blank them, and omitting the compliance context (listing OR
// attestation) would re-trigger the "attach a listing or attest" gate. So a
// "reschedule" re-sends the post's current content unchanged + the new time.
const minimalUpdateArgs = (
  post: SocialPost,
  scheduledAt: string | null,
): Parameters<typeof savePost>[0] => {
  // Re-send existing media as public URLs where we have them. parseMediaRefs
  // returns { ref, url } — we send url when present, else the opaque ref (the
  // route accepts both via imageUrls/mediaRefs round-trip, same as edit).
  const imageUrls = parseMediaRefs(post.mediaRefs)
    .map((m) => m.url ?? m.ref)
    .filter((u): u is string => typeof u === 'string' && u !== '');

  const networks = (post.networks ?? []).filter(
    (n): n is SocialNetwork =>
      n === 'FACEBOOK' || n === 'INSTAGRAM' || n === 'LINKEDIN' || n === 'TIKTOK',
  );

  const hasListing = post.listingId !== null && post.listingId !== '';

  return {
    postId: post.id,
    body: post.body ?? '',
    networks,
    imageUrls,
    listingId: hasListing ? post.listingId : null,
    attestedNoProperty: post.attestedNoProperty ?? false,
    scheduledAt,
  };
};

// Reschedule a post to a new instant. `newIso` is the new scheduledAt (already an
// ISO string). Reuses savePost so the server re-runs its gate; returns the same
// normalized SaveOutcome the composer uses (so callers branch identically).
export const reschedulePost = async (
  post: SocialPost,
  newIso: string,
): Promise<SaveOutcome> => savePost(minimalUpdateArgs(post, newIso));

// "Publish now" = move scheduledAt to now so the publish cron picks it up on its
// next pass. It is NOT an immediate publish (the cron owns publishing); the label
// in the UI reflects that ("queues for the next publish run"). DRAFT/SCHEDULED
// only — the drawer gates this by status.
export const publishNow = async (post: SocialPost): Promise<SaveOutcome> =>
  savePost(minimalUpdateArgs(post, new Date().toISOString()));

// A normalized delete outcome — mirrors SaveOutcome's shape so the drawer footer
// can render success/failure the same way it does for save.
export type DeleteOutcome =
  | { ok: true }
  | { ok: false; code: string; message: string; operatorAction: string | null };

const DELETE_ERROR_FALLBACK: Record<string, string> = {
  ILLEGAL_TRANSITION:
    'This post can no longer be deleted (it may already be publishing or live).',
  NOT_FOUND: 'You do not have access to do that.',
  ENV_MISSING: 'Social posting is not configured on this environment.',
};

const isDeleteEnvelope = (
  res: unknown,
): res is { error?: string; code?: string; operatorAction?: string } =>
  typeof res === 'object' &&
  res !== null &&
  (res as { ok?: unknown }).ok !== true &&
  typeof (res as { code?: unknown }).code === 'string';

// Delete a post via /marketing/social/delete-post. The ROUTE enforces the legal
// set (DRAFT|SCHEDULED|FAILED only) and returns ILLEGAL_TRANSITION otherwise —
// the UI only offers Delete for those statuses, but we still surface the envelope
// honestly if the server disagrees (e.g. a race where the cron picked it up).
export const deletePost = async (postId: string): Promise<DeleteOutcome> => {
  const res = await callPropelRoute<unknown>('/marketing/social/delete-post', {
    body: { postId },
  });

  if (res === null) {
    return {
      ok: false,
      code: 'NETWORK',
      message: "Couldn't reach the server. Check your connection and try again.",
      operatorAction: null,
    };
  }

  if (isDeleteEnvelope(res)) {
    const code = res.code ?? 'UNKNOWN';
    const message =
      (typeof res.error === 'string' && res.error) ||
      DELETE_ERROR_FALLBACK[code] ||
      'Something went wrong deleting this post.';
    return { ok: false, code, message, operatorAction: res.operatorAction ?? null };
  }

  const ok = res as { ok?: boolean };
  if (ok.ok === true) return { ok: true };

  return {
    ok: false,
    code: 'UNKNOWN',
    message: 'Something went wrong deleting this post.',
    operatorAction: null,
  };
};
