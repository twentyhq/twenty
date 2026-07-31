import type { CALL_RECORDING_REQUEST_STATUS } from 'src/logic-functions/constants/call-recording-request-status.constant';
import type { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status.constant';
import { type TranscriptEntry } from 'src/logic-functions/types/transcript-entry.type';

export type CallRecordingSyncFields = {
  title?: string;
  status?:
    | typeof CALL_RECORDING_STATUS.PROCESSING
    | typeof CALL_RECORDING_STATUS.COMPLETED;
  recordingRequestStatus?: typeof CALL_RECORDING_REQUEST_STATUS.REQUESTED;
  externalRecordingId?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: TranscriptEntry[];
  summary?: { markdown: string; blocknote: null };
  calendarEventId?: string;
};
