export const ReconcileUpcomingCalendarEventsOutcome = {
  PROCESSED: 'processed',
  NOTHING_SELECTED: 'nothing-selected',
  NOTHING_TO_RECONCILE: 'nothing-to-reconcile',
} as const;

export type ReconcileUpcomingCalendarEventsOutcome =
  (typeof ReconcileUpcomingCalendarEventsOutcome)[keyof typeof ReconcileUpcomingCalendarEventsOutcome];
