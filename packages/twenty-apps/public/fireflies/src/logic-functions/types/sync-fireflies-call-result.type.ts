import { type FirefliesSyncableField } from 'src/logic-functions/types/fireflies-syncable-field.type';

export type SyncFirefliesCallResult =
  | {
      status: 'updated';
      field: FirefliesSyncableField;
      callRecordingId: string;
      calendarEventId?: string;
      created: boolean;
    }
  | { status: 'skipped'; field: FirefliesSyncableField; reason: string }
  | {
      status: 'error';
      field: FirefliesSyncableField;
      error: string;
      httpStatus?: number;
    };
