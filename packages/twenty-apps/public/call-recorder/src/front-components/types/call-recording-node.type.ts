export type CallRecordingNode = {
  id: string;
  title?: string | null;
  startedAt?: string | null;
  createdAt?: string | null;
  calendarEventId?: string | null;
  calendarEvent?: {
    id: string;
    title?: string | null;
    startsAt?: string | null;
  } | null;
};
