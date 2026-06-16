// Local TypeScript contracts for the graduated 1:1 Runner hero (the Weekly 1:1
// Hub + the per-lead Meeting Runner).
//
// These mirror the SUBSET of the Propel serverless payloads this hero consumes:
//   POST /s/one-on-one/hub                    → HubPayload
//   POST /s/one-on-one/available-slots        → { slots: Slot[] }
//   POST /s/one-on-one/book-meeting           → { meetingId? , error? }
//   POST /s/one-on-one/generate-review-lines  → batched progress
//   POST /s/one-on-one/complete-meeting       → completion summary
//   POST /graphql leadReviewLines / updateLeadReviewLine (the per-lead rows)
//
// The canonical shapes live in the OTHER repo (propel-crm-integration):
//   src/shared/one-on-one-hub.ts            (HubPayload contract)
//   src/shared/one-on-one-hub-panel.tsx     (the in-sandbox consumer)
//   src/shared/one-on-one-runner-panel.tsx  (the in-sandbox Runner)
// We deliberately do NOT import across repos — this file is the fork-local copy of
// only what the hero reads. Nothing here adds, renames, or reshapes a backend
// route, object, or field; it is a faithful read-only mirror.

// ── Hub payload (matches /one-on-one/hub verbatim) ───────────────────────────

export type HubTier = 'MANAGER' | 'AGENT' | 'PLAYER_COACH';

export type HubMe = {
  id: string;
  label: string;
  /** Asia/Dubai week-of-Monday label, e.g. "Jun 8" */
  weekLabel?: string | null;
  /** server-resolved color scheme fallback (unused on FE — we read ThemeContext) */
  dark?: boolean;
};

export type AvailabilityWindow = {
  id?: string | null;
  dayOfWeek: string; // MON..SUN
  startTime: string; // "10:00"
  endTime: string; // "12:00"
  slotMinutes?: number | null;
};

export type TeamRow = {
  agentId: string;
  label: string;
  booked: boolean;
  held: boolean;
  /** number of leads flagged for this agent this week */
  flagged: number;
  /** last 1:1 date label ("Jun 1") or null = never */
  lastOneOnOne?: string | null;
};

export type UpcomingMeeting = {
  meetingId: string;
  agentLabel: string;
  /** "Thu 10:00" (Asia/Dubai, formatted by the route) */
  whenLabel: string;
  scheduledAtIso?: string | null;
  /** deep-link the route supplies (/object/oneOnOneMeeting/:id) — we open the Runner inline instead */
  runUrl?: string | null;
};

export type ManagerBlock = {
  adherence: {
    pct: number;
    bookedNum: number;
    bookedDen: number;
    held: number;
    missed: number;
    reviewed: number;
    flagged: number;
    stalled: number;
  };
  /** the manager's own current weekly availability */
  availability: AvailabilityWindow[];
  /** open slot count this week (precomputed by the route) */
  openSlotCount?: number | null;
  team: TeamRow[];
  /** agents who have not booked this week */
  needsBooking: { agentId: string; label: string }[];
  upcoming: UpcomingMeeting[];
};

export type NextMeeting = {
  meetingId: string;
  whenLabel: string; // "Thu · 10:00"
  managerLabel: string; // "Nancy"
  durationMinutes?: number | null;
  runUrl?: string | null;
};

export type AgentBlock = {
  /** the agent's next upcoming 1:1, or null if none booked */
  nextMeeting: NextMeeting | null;
  /** open leads across all pipelines */
  openLeads: number;
  /** the agent's resolved manager (picker auto-select); null = no manager */
  manager: { id: string; label: string } | null;
};

export type HubPayload = {
  tier: HubTier;
  me: HubMe;
  manager?: ManagerBlock | null; // present for MANAGER + PLAYER_COACH
  agent?: AgentBlock | null; // present for AGENT + PLAYER_COACH
};

// ── Booking (available-slots / book-meeting) ─────────────────────────────────

export type Slot = { startAtIso: string; endAtIso: string };

export type AvailableSlotsResponse = {
  managerId?: string;
  weekStartIso?: string;
  slots?: Slot[];
  error?: string;
};

export type BookMeetingResponse = {
  meetingId?: string;
  error?: string;
};

// ── Runner: per-lead review lines (GraphQL leadReviewLine custom object) ──────

export type ReviewStatus = 'PENDING' | 'DISCUSSED' | 'FLAGGED' | 'STALLED';

export type Money = {
  amountMicros?: string | number | null;
  currencyCode?: string | null;
} | null;

/** one pre-formatted display row baked into detailsSnapshot (RAW_JSON) */
export type Detail = { label: string; value: string };

export type ReviewLine = {
  id: string;
  clientName?: string | null;
  leadObjectType?: string | null;
  leadRecordId?: string | null;
  stageSnapshot?: string | null;
  sourceSnapshot?: string | null;
  budgetSnapshot?: Money;
  segmentSnapshot?: string | null;
  /** RAW_JSON: parsed [{label,value}] rows; defensively also accepts a JSON string */
  detailsSnapshot?: Detail[] | string | null;
  lastActivityAt?: string | null;
  notes?: string | null;
  nextAction?: string | null;
  discussed?: boolean | null;
  lineStatus?: ReviewStatus | null;
  closedSincePrep?: boolean | null;
};

// ── generate-review-lines (batched mode) ─────────────────────────────────────

export type GenerateBatchCursor = { pi: number; after: string | null };

export type GenerateBatchResponse = {
  meetingId?: string;
  total?: number;
  created?: number;
  processedThisBatch?: number;
  nextCursor?: GenerateBatchCursor | null;
  done?: boolean;
  error?: string;
};

// ── complete-meeting ─────────────────────────────────────────────────────────

export type CompleteMeetingResponse = {
  meetingId?: string;
  status?: string;
  linesReviewed?: number;
  tasksCreated?: number;
  error?: string;
};
