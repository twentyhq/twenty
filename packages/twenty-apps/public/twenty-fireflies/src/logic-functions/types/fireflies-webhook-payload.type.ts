export type FirefliesWebhookPayload = {
  event: string;
  meeting_id: string;
  timestamp?: number;
  client_reference_id?: string | null;
};

export type FirefliesSyncedField = 'transcript' | 'summary';

export type FirefliesWebhookResult =
  | {
      action: 'updated';
      field: FirefliesSyncedField;
      calendarEventId: string;
      meetingId: string;
    }
  | { skipped: true; reason: string; meetingId?: string }
  | { error: string; meetingId?: string };
