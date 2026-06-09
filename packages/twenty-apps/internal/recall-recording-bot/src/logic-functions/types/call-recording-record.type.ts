import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';

export type CallRecordingRecord = {
  id: string;
  title?: string | null;
  status?: string | null;
  recordingRequestStatus?: CallRecordingRequestStatus | null;
  startedAt?: string | null;
  endedAt?: string | null;
  calendarEventId?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
};
