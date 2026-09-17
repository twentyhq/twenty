import { type RecordingStatus } from './RecordingStatus';

export type Recording = {
  participants?: { id: string; name: string; avatarUrl?: string | null }[];
  id: string;
  title: string;
  status: RecordingStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  calendarEventId?: string | null;
};
