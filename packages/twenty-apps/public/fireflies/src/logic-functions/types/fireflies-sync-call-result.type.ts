import { type FirefliesSyncableField } from 'src/logic-functions/types/fireflies-syncable-field.type';

export type FirefliesSyncCallFieldOutcome =
  | { field: FirefliesSyncableField; status: 'updated' }
  | { field: FirefliesSyncableField; status: 'skipped'; reason: string }
  | { field: FirefliesSyncableField; status: 'error'; error: string };

export type FirefliesSyncCallResult = {
  success: boolean;
  message: string;
  error?: string;
  transcriptId?: string;
  callRecordingId?: string;
  calendarEventId?: string;
  updatedFields?: FirefliesSyncableField[];
  fieldOutcomes?: FirefliesSyncCallFieldOutcome[];
};
