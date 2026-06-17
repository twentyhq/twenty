// Defensive parsers + derivations for the post-detail drawer (S2).
//
// The backend stores `mediaRefs` and `perNetworkResults` as TEXT columns holding
// JSON strings (social-post.object.ts), so the status route returns them as-is —
// often a *string*, occasionally already-parsed, sometimes null/empty/garbage.
// Everything here parses defensively and NEVER throws: a bad value degrades to an
// empty/honest result so the drawer renders gracefully and never fabricates data
// (the hero's fail-soft contract).

import {
  type SocialListing,
  type SocialPost,
  type SocialPostStatus,
} from '@/propel/types/socialCalendar';

// A media item resolved from `mediaRefs`. Entries are either a public image/video
// URL (listing photos) or an opaque Postiz media id (no fetchable URL). We only
// know it's an image we can render when it looks like a URL.
export type MediaItem = {
  /** the raw ref string */
  ref: string;
  /** a renderable URL if the ref is an http(s) link, else null (opaque id) */
  url: string | null;
  /** best-effort: looks like a video by extension */
  isVideo: boolean;
};

// One per-network publish result. The route emits two shapes (social-publish.ts
// / social-status-poll.ts): an ARRAY of { network, status, error? } on
// success/poll, or an OBJECT { error, requestedNetworks? } on a hard failure.
// We normalize both into this list so the drawer renders one row per network.
export type NetworkResult = {
  network: string | null;
  status: string | null;
  error: string | null;
};

const VIDEO_EXT = /\.(mp4|mov|webm|m4v|ogg)(\?|#|$)/i;

const isHttpUrl = (s: string): boolean =>
  s.startsWith('http://') || s.startsWith('https://');

// Parse `mediaRefs` (JSON string of string[], or already-parsed) into media
// items. Anything non-string/non-array yields []. Never throws.
export const parseMediaRefs = (mediaRefs: unknown): MediaItem[] => {
  let arr: unknown = mediaRefs;
  if (typeof mediaRefs === 'string') {
    const trimmed = mediaRefs.trim();
    if (trimmed === '') return [];
    try {
      arr = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((r): r is string => typeof r === 'string' && r.trim() !== '')
    .map((ref) => {
      const url = isHttpUrl(ref) ? ref : null;
      return { ref, url, isVideo: url !== null && VIDEO_EXT.test(url) };
    });
};

// Count attachable media without building the full list (used by the pill too —
// matches the array-length intent but parses the JSON string first).
export const countMedia = (mediaRefs: unknown): number =>
  parseMediaRefs(mediaRefs).length;

// Normalize `perNetworkResults` (JSON string / parsed) into a flat list. Handles:
//   - array  [{ network, status, error? }]                   (success/poll)
//   - object { error, requestedNetworks? }                   (hard failure)
//   - object { error } with no networks                      (compliance block)
// Anything else → []. Never throws.
export const parsePerNetworkResults = (value: unknown): NetworkResult[] => {
  let parsed: unknown = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return [];
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed
      .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
      .map((r) => ({
        network: typeof r.network === 'string' ? r.network : null,
        status: typeof r.status === 'string' ? r.status : null,
        error: typeof r.error === 'string' ? r.error : null,
      }));
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const error = typeof obj.error === 'string' ? obj.error : null;
    const requested = Array.isArray(obj.requestedNetworks)
      ? obj.requestedNetworks.filter((n): n is string => typeof n === 'string')
      : [];
    // A failure object with requestedNetworks → one row per requested network,
    // all carrying the shared error. Otherwise a single error row.
    if (requested.length > 0) {
      return requested.map((network) => ({ network, status: 'failed', error }));
    }
    if (error !== null) {
      return [{ network: null, status: 'failed', error }];
    }
  }

  return [];
};

// The single overall error string for a FAILED post, if any (for the footer /
// failure banner). Pulls from the object-shape `{ error }` or the first errored
// network row.
export const overallError = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== '' && !trimmed.startsWith('[') && !trimmed.startsWith('{')) {
      // a plain non-JSON string is itself the error message
      return trimmed;
    }
  }
  const rows = parsePerNetworkResults(value);
  const errored = rows.find((r) => r.error !== null && r.error !== '');
  return errored?.error ?? null;
};

// Resolve a post's listingId to a human listing name using the listings[] the
// status route already returns. Returns null when there's no match (don't
// fabricate a name).
export const resolveListingName = (
  listingId: string | null,
  listings: SocialListing[] | undefined,
): string | null => {
  if (listingId === null || listingId === '') return null;
  const match = (listings ?? []).find((l) => l.id === listingId);
  return match?.name ?? null;
};

// Build the Postiz "view live" URL for a published post. The ONLY live handle in
// the payload is `postizPostId` + the Postiz host (`connectUrl`); there is no
// per-network public permalink stored, so we link to the Postiz post itself
// (where the launch + its network results live). Returns null when either piece
// is missing — we never invent a network permalink.
export const buildPostizLiveUrl = (
  postizPostId: string | null,
  connectUrl: string | undefined,
): string | null => {
  if (postizPostId === null || postizPostId === '') return null;
  if (connectUrl === undefined || connectUrl === '') return null;
  let base: string;
  try {
    base = new URL(connectUrl).origin;
  } catch {
    return null;
  }
  return `${base}/launches?post=${encodeURIComponent(postizPostId)}`;
};

// Lifecycle timeline (§4.5). Status is monotonic DRAFT → SCHEDULED → PUBLISHING →
// POSTED|FAILED. We render the canonical track and mark each stage done / current
// / pending / failed relative to the post's current status. Timestamps: we only
// truthfully know `createdAt` (≈ Draft) and `scheduledAt` (the Scheduled/Posted
// target). We attach those where honest and leave the rest blank rather than
// inventing publish times the payload doesn't carry.
export type TimelineStageKey =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'POSTED'
  | 'FAILED';

export type TimelineStage = {
  key: TimelineStageKey;
  label: string;
  state: 'done' | 'current' | 'pending' | 'failed';
  /** ISO timestamp we can honestly attribute to this stage, else null */
  at: string | null;
};

// Order index for the happy path (FAILED is terminal, handled specially).
const HAPPY_ORDER: TimelineStageKey[] = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHING',
  'POSTED',
];

export const buildTimeline = (post: SocialPost): TimelineStage[] => {
  const status: SocialPostStatus = post.status;
  const isFailed = status === 'FAILED';

  // Where the current status sits on the happy path. FAILED is treated as
  // sitting at the PUBLISHING slot (it failed while/after attempting to publish).
  const currentIndex = isFailed
    ? HAPPY_ORDER.indexOf('PUBLISHING')
    : HAPPY_ORDER.indexOf(status as TimelineStageKey);

  const labelFor: Record<TimelineStageKey, string> = {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    PUBLISHING: 'Publishing',
    POSTED: 'Posted',
    FAILED: 'Failed',
  };

  const happy: TimelineStage[] = HAPPY_ORDER.map((key, i) => {
    let state: TimelineStage['state'];
    if (i < currentIndex) state = 'done';
    else if (i === currentIndex) state = isFailed ? 'done' : 'current';
    else state = 'pending';

    // Honest timestamps only.
    let at: string | null = null;
    if (key === 'DRAFT') at = post.createdAt;
    else if (key === 'SCHEDULED') at = post.scheduledAt;
    else if (key === 'POSTED' && status === 'POSTED') at = post.scheduledAt;

    return { key, label: labelFor[key], state, at };
  });

  if (isFailed) {
    // Replace the trailing POSTED node with a FAILED terminal node.
    const withoutPosted = happy.filter((s) => s.key !== 'POSTED');
    withoutPosted.push({
      key: 'FAILED',
      label: labelFor.FAILED,
      state: 'failed',
      at: null,
    });
    return withoutPosted;
  }

  return happy;
};

// Format an ISO string for the drawer. Returns null on missing/invalid so callers
// can choose their own fallback copy.
export const formatDateTime = (iso: string | null): string | null => {
  if (iso === null || iso === '') return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatTimeShort = (iso: string | null): string | null => {
  if (iso === null || iso === '') return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Engagement metric, formatted. Null counts render as "—" (unknown), 0 renders as
// "0" (known-zero). Compact for large numbers (1.2k).
export const formatMetric = (n: number | null): string => {
  if (n === null) return '—';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
};
