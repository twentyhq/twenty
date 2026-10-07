import { type TranscriptEntry } from 'src/features/transcripts/logic-functions/types/transcript-entry.type';

export type CallRecordingSyncFields = {
  title?: string;
  status: 'PROCESSING' | 'COMPLETED';
  externalRecordingId: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: TranscriptEntry[];
  calendarEventId?: string;
};
