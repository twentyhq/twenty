export type FathomMeetingSyncResult =
  | {
      callRecordingId: string;
      calendarEventId?: string;
      created: boolean;
    }
  | {
      callRecordingId: string;
      skipped: true;
      reason: string;
    };
