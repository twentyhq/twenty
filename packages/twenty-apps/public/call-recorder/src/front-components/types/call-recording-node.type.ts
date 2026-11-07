export type CallRecordingNode = {
  id: string;
  title?: string | null;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt?: string | null;
  calendarEventId?: string | null;
  calendarEvent?: {
    id: string;
    title?: string | null;
    startsAt?: string | null;
    isShared?: boolean;
  } | null;
};
