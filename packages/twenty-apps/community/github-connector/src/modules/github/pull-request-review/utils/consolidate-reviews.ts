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
