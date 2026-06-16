// Local TypeScript contracts for the graduated Marketing Home dashboard.
//
// These mirror the SUBSET of the Propel serverless payloads this hero consumes
// (POST /s/marketing/analytics, /s/marketing/hub, /s/marketing/dashboard-layout).
// The canonical shapes live in the OTHER repo (propel-crm-integration):
//   src/shared/marketing-analytics-types.ts
//   src/shared/marketing-hub-types.ts
//   src/shared/marketing-presence.ts
// We deliberately do NOT import across repos — this file is the fork-local copy of
// only what the widgets read. Everything is optional / presence-guarded: the routes
// follow a strict "never show data you don't have" contract (docs/MARKETING-CLOUD.md),
// so the UI renders ONLY present:true blocks and never zero-fills.

// ── Presence wrapper (marketing-presence.ts) ─────────────────────────────────
export type Presence<T> =
  | { present: true; value: T }
  | { present: false; reason?: string };

export type AnalyticsRange = '7d' | '30d' | '90d';

export type RealChannel = 'EMAIL' | 'WHATSAPP';

export interface Metric {
  value: number;
  /** percentage change vs the prior equal window; null = no comparable base */
  deltaPct: number | null;
  /** optional server-bucketed sparkline points */
  spark?: number[];
}

export interface SeriesPoint {
  dayKey: string;
  label: string;
  value: number;
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  isProxy?: boolean;
  ratePct?: number | null;
}

export interface ChannelTotals {
  channel: RealChannel;
  sent: number;
  delivered: number;
  deliveredIsProxy: boolean;
  openRate: number | null;
  replies: number;
  spark: number[];
}

export interface RevenueChannelSlice {
  source: string;
  label: string;
  revenue: number;
  deals: number;
}

export interface RevenueAttributed {
  total: number;
  deals: number;
  asOfLabel: string;
  byChannel: RevenueChannelSlice[];
  campaignTotal: number;
  confirmedRevenue: number;
  lastTouchRevenue: number;
}

export interface SocialEngagement {
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
}

// ── POST /s/marketing/analytics ──────────────────────────────────────────────
export interface MarketingAnalyticsPayload {
  tier?: string;
  range?: AnalyticsRange;
  generatedAtLabel?: string;
  kpis?: {
    sent?: Metric;
    openRate?: Metric; // value is a whole-number percent
    replies?: Metric;
    revenue?: Presence<RevenueAttributed>;
  };
  trend?: Presence<{
    series: SeriesPoint[];
    byChannel: { channel: RealChannel; values: number[] }[];
  }>;
  funnel?: { stages: FunnelStage[] };
  channels?: ChannelTotals[];
  social?: Presence<SocialEngagement>;
}

// ── POST /s/marketing/hub (subset) ───────────────────────────────────────────
export interface SendingNowRow {
  id: string;
  name: string;
  channel: RealChannel;
  sentCount: number;
  pendingLeft: number;
  failedCount: number;
  targetCount: number;
  startedLabel: string;
}

export interface AttentionRow {
  id: string;
  kind: 'FAILED_CAMPAIGN' | 'HOT_REPLY' | 'DEAD_LETTER';
  title: string;
  detail: string;
  whenLabel: string;
  campaignId?: string;
}

export interface MarketingHubPayload {
  tier?: string;
  greeting?: string;
  generatedAtLabel?: string;
  sendingNow?: SendingNowRow[];
  sendingNowTotal?: number;
  needsAttention?: AttentionRow[];
  firstRun?: boolean;
}

// ── POST /s/marketing/dashboard-layout ───────────────────────────────────────
// Persisted per-user grid arrangement. `layouts` is stored opaquely server-side
// (it is react-grid-layout's `Layouts` keyed by breakpoint, plus our list of
// enabled widget ids). null until the user has saved a custom arrangement.
export interface DashboardLayoutGetResponse {
  ok?: boolean;
  layouts?: PersistedDashboardLayout | null;
}

export interface DashboardLayoutSetResponse {
  ok?: boolean;
  error?: string;
}

// Our own opaque payload shape (the route never interprets it).
export interface PersistedDashboardLayout {
  layouts: import('react-grid-layout').Layouts;
  enabledWidgetIds: string[];
}
