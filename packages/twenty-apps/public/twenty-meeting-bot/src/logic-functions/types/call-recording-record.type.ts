import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';

// Domain read shape: absence is always undefined; null lives only on wire types.
export type CallRecordingRecord = {
  id: string;
  title?: string;
  status?: string;
  recordingRequestStatus?: CallRecordingRequestStatus;
  startedAt?: string;
  endedAt?: string;
  calendarEventId?: string;
  externalBotId?: string;
  externalRecordingId?: string;
  meetingBotFailureReason?: string;
};
