export type MeetingBotReconciliationResult =
  | {
      action: 'CREATED' | 'UPDATED' | 'CANCELED';
      realMeetingKey: string;
      callRecordingId: string;
    }
  | {
      action: 'SKIPPED';
      realMeetingKey: string;
      callRecordingId: string | null;
    }
  | {
      action: 'FAILED';
      realMeetingKey: string;
      errorMessage: string;
    };
