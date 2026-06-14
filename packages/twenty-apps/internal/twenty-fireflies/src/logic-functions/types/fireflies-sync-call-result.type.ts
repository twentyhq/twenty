import { type FirefliesSyncableField } from 'src/logic-functions/utils/sync-fireflies-field-to-calendar-event';

export type FirefliesSyncCallFieldOutcome =
  | { field: FirefliesSyncableField; status: 'updated' }
  | { field: FirefliesSyncableField; status: 'skipped'; reason: string }
  | { field: FirefliesSyncableField; status: 'error'; error: string };

export type FirefliesSyncCallResult = {
  success: boolean;
  message: string;
  error?: string;
  transcriptId?: string;
  calendarEventId?: string;
  updatedFields?: FirefliesSyncableField[];
  fieldOutcomes?: FirefliesSyncCallFieldOutcome[];
};
