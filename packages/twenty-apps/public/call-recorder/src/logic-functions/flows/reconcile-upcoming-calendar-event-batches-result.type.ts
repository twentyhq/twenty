export type ReconcileUpcomingCalendarEventBatchesResult = {
  reconciledCalendarEventIds: string[];
  failedCalendarEventIds: string[];
  remainingCalendarEventIds: string[];
  actionCounts: {
    created: number;
    updated: number;
    canceled: number;
    skipped: number;
    failed: number;
  };
  continuationRequested: boolean;
};
