import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export type CallRecordingSyncFields = {
  title?: string;
  status: 'PROCESSING' | 'COMPLETED';
  externalRecordingId: string;
  startedAt: string;
  endedAt?: string;
  transcript?: TranscriptEntry[];
  summary?: { blocknote: null; markdown: string };
  calendarEventId?: string;
};
