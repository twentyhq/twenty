import { type CallRecorderReconciliationResult } from 'src/logic-functions/types/call-recorder-reconciliation-result.type';

export type UpcomingCalendarEventsReconciliationResult =
  | { skipped: true; reason: string }
  | {
      reconciled: true;
      calendarEventIds: string[];
      reconciliationResults: CallRecorderReconciliationResult[];
    };
