import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export type CallRecordingSyncFields = {
  title?: string;
  status?: 'PROCESSING' | 'COMPLETED';
  recordingRequestStatus?: 'REQUESTED';
  externalRecordingId?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: TranscriptEntry[];
  summary?: { markdown: string; blocknote: null };
  calendarEventId?: string;
};
