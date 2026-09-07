import { type CallRecordingMediaFile } from 'src/logic-functions/types/call-recording-media-file.type';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export type CallRecordingSyncFields = {
  title?: string;
  status?: 'PROCESSING' | 'COMPLETED';
  recordingRequestStatus?: 'REQUESTED';
  externalRecordingId?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: TranscriptEntry[];
  video?: CallRecordingMediaFile[];
  audio?: CallRecordingMediaFile[];
  summary?: { markdown: string; blocknote: null };
  calendarEventId?: string;
};
