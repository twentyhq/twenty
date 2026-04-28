import { Temporal } from 'temporal-polyfill';

// Statuses that close the milestone — overdue logic ignores records in
// these statuses (a DONE/CANCELLED record after its planned end is not
// "running late", it just finished/was dropped).
const TERMINAL_STATUSES = new Set(['DONE', 'CANCELLED']);

type ComputeArgs = {
  /** Originally planned end date of the milestone. Null when the view
      has no `roadmapFieldPlannedEnd` configured or the record is missing
      a planned date — both cases short-circuit to `{ deviationDays: 0,
      isOverdue: false }`. */
  plannedEndDate: Temporal.PlainDate | null;
  /** Actual / current end date as drawn on the bar. Falls back to the
      record's `endDate` when there's no separate "actual" tracking. */
  actualEndDate: Temporal.PlainDate;
  /** SELECT-value of the milestone status, used to gate the overdue and
      deviation calculations. `null` skips the gate (treated as open). */
  status: string | null;
  /** Today is injected so callers can memoize across the whole timeline
      without each bar reading the wall clock independently. */
  today: Temporal.PlainDate;
};

type Deviation = {
  /** Positive when actual / today is past planned. Always 0 for terminal
      statuses if the actual is on/before planned (early completions don't
      count as deviation in this MVP). */
  deviationDays: number;
  /** True when the milestone is open (status not terminal) and today is
      strictly past `plannedEndDate`. Drives the red-border / tooltip on
      the bar. */
  isOverdue: boolean;
};

export const computeRoadmapDeviation = ({
  plannedEndDate,
  actualEndDate,
  status,
  today,
}: ComputeArgs): Deviation => {
  if (plannedEndDate === null) {
    return { deviationDays: 0, isOverdue: false };
  }
  const isTerminal = status !== null && TERMINAL_STATUSES.has(status);

  if (isTerminal) {
    const slip = Temporal.PlainDate.compare(actualEndDate, plannedEndDate);
    if (slip <= 0) {
      return { deviationDays: 0, isOverdue: false };
    }
    return {
      deviationDays: actualEndDate.since(plannedEndDate).days,
      isOverdue: false,
    };
  }

  // Open milestone: combine *forecasted* slip (when actualEnd projects past
  // the planned end, even if today hasn't reached it yet) with classic
  // overdue (today > planned). Both contribute to deviationDays; only the
  // second flips isOverdue (the bar's red-border signal).
  const isOverdue =
    Temporal.PlainDate.compare(today, plannedEndDate) > 0;

  // The "effective" end is whichever is later between actual and today —
  // a future actualEnd surfaces as forecasted slip, a past today wins
  // when actual hasn't been set or is in the past.
  const effectiveEnd =
    Temporal.PlainDate.compare(actualEndDate, today) >= 0 ? actualEndDate : today;

  const cmp = Temporal.PlainDate.compare(effectiveEnd, plannedEndDate);
  if (cmp <= 0) {
    return { deviationDays: 0, isOverdue };
  }
  return {
    deviationDays: effectiveEnd.since(plannedEndDate).days,
    isOverdue,
  };
};
