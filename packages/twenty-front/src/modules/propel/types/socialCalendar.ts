// Shared types for the Social Posting Calendar hero (P3 hero #5).
//
// The calendar reads `socialPost` records from the CRM app route
//   POST /s/marketing/social/connect { action: 'status' }
// which returns the envelope below. These types mirror the route's response
// shape (src/logic-functions/social-connect-route.ts in propel-crm-integration)
// — the calendar never touches a Postiz session; Postiz stays the publish engine.

export type SocialNetwork = 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'TIKTOK';

export type SocialPostStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'POSTED'
  | 'FAILED';

export type SocialAccountStatus = 'CONNECTED' | 'EXPIRED' | string;

// One connected channel (a Postiz integration mirrored as a socialAccount).
export type SocialAccount = {
  id: string;
  network: SocialNetwork | string;
  displayName: string | null;
  status: SocialAccountStatus;
  postizIntegrationId: string | null;
};

// A socialPost record as returned by the status route. `networks` is a
// MULTI_SELECT (array of network keys). `scheduledAt` / `createdAt` are ISO
// strings (or null for an unscheduled draft).
export type SocialPost = {
  id: string;
  name: string | null;
  body: string | null;
  networks: SocialNetwork[] | null;
  status: SocialPostStatus;
  scheduledAt: string | null;
  postizPostId: string | null;
  mediaRefs: unknown;
  listingId: string | null;
  attestedNoProperty: boolean | null;
  perNetworkResults: unknown;
  likeCount: number | null;
  commentCount: number | null;
  shareCount: number | null;
  impressionCount: number | null;
  createdAt: string | null;
};

export type SocialListing = {
  id: string;
  name: string | null;
  status: string;
};

// The full status envelope. Every field is optional/defensive because
// callPropelRoute returns the parsed body as-is and may return null on failure.
export type SocialStatusPayload = {
  ok?: boolean;
  connectUrl?: string;
  connectMessage?: string;
  linkedInMessage?: string;
  integrations?: unknown[];
  accounts?: SocialAccount[];
  posts?: SocialPost[];
  listings?: SocialListing[];
};

// The calendar event we hand to react-big-calendar. It extends the library's
// Event contract (title/start/end) and carries the originating post so pills can
// render status/network without a second lookup.
export type SocialCalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  post: SocialPost;
};

export type SocialCalendarView = 'month' | 'week' | 'agenda';

// Filter state. `null`/empty means "no filter" (show everything).
export type SocialCalendarFilters = {
  networks: SocialNetwork[];
  statuses: SocialPostStatus[];
};
