export type ReviewEventState =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'COMMENTED'
  | 'DISMISSED';

export type ReviewEventForConsolidation = {
  state: ReviewEventState;
  submittedAt: string | null;
};

export type ConsolidatedVerdict = {
  state: ReviewEventState;
  firstSubmittedAt: string | null;
  lastSubmittedAt: string | null;
  eventCount: number;
};

const SUBSTANTIVE_STATES: ReadonlyArray<ReviewEventState> = [
  'APPROVED',
  'CHANGES_REQUESTED',
];

const isSubstantive = (state: ReviewEventState): boolean =>
  SUBSTANTIVE_STATES.includes(state);

const compareSubmittedAt = (
  a: ReviewEventForConsolidation,
  b: ReviewEventForConsolidation,
): number => {
  const av = a.submittedAt ?? '';
  const bv = b.submittedAt ?? '';
  if (av === bv) return 0;
  return av < bv ? -1 : 1;
};

/**
 * Consolidates the raw review events for a single (PR, reviewer) pair into a
 * single verdict using the "first substantive wins" rule:
 *   - If any event is APPROVED or CHANGES_REQUESTED, the earliest such event
 *     determines the verdict state and `firstSubmittedAt`.
 *   - Otherwise (only COMMENTED / DISMISSED events), the earliest event wins.
 *   - `lastSubmittedAt` is the latest `submittedAt` across all events.
 *   - `eventCount` is the number of raw events fed in.
 *
 * Throws if `events` is empty (callers should never group an empty bucket).
 */
export const consolidateReviews = (
  events: ReviewEventForConsolidation[],
): ConsolidatedVerdict => {
  if (events.length === 0) {
    throw new Error('consolidateReviews called with empty events');
  }

  const sorted = [...events].sort(compareSubmittedAt);
  const substantive = sorted.find((e) => isSubstantive(e.state));
  const chosen = substantive ?? sorted[0];

  return {
    state: chosen.state,
    firstSubmittedAt: chosen.submittedAt,
    lastSubmittedAt: sorted[sorted.length - 1].submittedAt,
    eventCount: sorted.length,
  };
};
