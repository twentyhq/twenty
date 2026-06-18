import { useCallback, useEffect, useMemo, useState } from 'react';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  type SocialAccount,
  type SocialCalendarEvent,
  type SocialListing,
  type SocialNetwork,
  type SocialPost,
  type SocialStatusPayload,
} from '@/propel/types/socialCalendar';

// Loads the Social Posting Calendar's data from the CRM app route
//   POST /s/marketing/social/connect { action: 'status' }
// and derives calendar events from the returned socialPost records.
//
// Fails soft, exactly like the other heroes: a null route response leaves
// `payload === null`, which the page renders as an honest "couldn't load" state
// with Retry — it never throws or fabricates posts. The route is coordinator-
// gated server-side (non-coordinator → NOT_FOUND → null here), so a non-
// coordinator simply sees the empty/error surface; no client-side role logic.

const KNOWN_NETWORKS: SocialNetwork[] = [
  'FACEBOOK',
  'INSTAGRAM',
  'LINKEDIN',
  'TIKTOK',
];

export type SocialCalendarState = {
  payload: SocialStatusPayload | null;
  accounts: SocialAccount[];
  posts: SocialPost[];
  events: SocialCalendarEvent[];
  /** LIVE listings the composer can attach (from the same status payload) */
  listings: SocialListing[];
  /** the Postiz connect URL (one-time channel connect bounce) */
  connectUrl: string | undefined;
  /** the distinct networks with a CONNECTED account — what the composer enables */
  connectedNetworks: SocialNetwork[];
  /** true while a fetch is in flight */
  isLoading: boolean;
  /** true once at least one fetch attempt has settled (success or failure) */
  loaded: boolean;
  /** true once a settled fetch returned null (route error / not reachable) */
  isError: boolean;
  reload: () => void;
};

// A post is placeable on the calendar only if it has a real scheduledAt; an
// unscheduled draft (scheduledAt === null) has no grid position. We fall back to
// createdAt for POSTED/FAILED posts that lost their scheduledAt, so published
// history still shows. Invalid dates are dropped (never crash the grid).
const toEvent = (post: SocialPost): SocialCalendarEvent | null => {
  const iso = post.scheduledAt ?? post.createdAt;
  if (iso === null || iso === '') return null;

  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return null;

  // Posts are point-in-time; give a 30-min nominal duration so week/day views
  // render a visible block. Month view ignores end time.
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const title =
    post.name !== null && post.name !== ''
      ? post.name
      : post.body !== null && post.body !== ''
        ? post.body
        : 'Untitled post';

  return { title, start, end, post };
};

export const useSocialCalendarData = (): SocialCalendarState => {
  const [payload, setPayload] = useState<SocialStatusPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void callPropelRoute<SocialStatusPayload>('/marketing/social/connect', {
      action: 'status',
    }).then((res) => {
      if (!active) return;
      setPayload(res);
      setIsError(res === null);
      setIsLoading(false);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [nonce]);

  const accounts = useMemo(
    () => (Array.isArray(payload?.accounts) ? payload.accounts : []),
    [payload],
  );

  const posts = useMemo(
    () => (Array.isArray(payload?.posts) ? payload.posts : []),
    [payload],
  );

  const events = useMemo(
    () =>
      posts.map(toEvent).filter((e): e is SocialCalendarEvent => e !== null),
    [posts],
  );

  const listings = useMemo(
    () => (Array.isArray(payload?.listings) ? payload.listings : []),
    [payload],
  );

  const connectUrl = payload?.connectUrl;

  // The networks the composer can enable: distinct networks across CONNECTED
  // accounts. We treat any account whose status isn't an explicit 'EXPIRED' as
  // usable (the route already only returns linked accounts).
  const connectedNetworks = useMemo<SocialNetwork[]>(() => {
    const seen = new Set<SocialNetwork>();
    for (const a of accounts) {
      if (a.status === 'EXPIRED') continue;
      const n = a.network as SocialNetwork;
      if (KNOWN_NETWORKS.includes(n)) seen.add(n);
    }
    return KNOWN_NETWORKS.filter((n) => seen.has(n));
  }, [accounts]);

  return {
    payload,
    accounts,
    posts,
    events,
    listings,
    connectUrl,
    connectedNetworks,
    isLoading,
    loaded,
    isError,
    reload,
  };
};
