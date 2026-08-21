import { type CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingBotScheduleAttempt } from 'src/logic-functions/domain/call-recording-bot-schedule-attempt';

// Domain read shape: absence is always undefined; null lives only on wire types.
export type CallRecordingRecord = {
  id: string;
  title?: string;
  status?: string;
  recordingRequestStatus?: CallRecordingRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string;
  endedAt?: string;
  calendarEventId?: string;
  externalBotId?: string;
  botScheduleAttempt?: CallRecordingBotScheduleAttempt;
  externalRecordingId?: string;
  callRecorderFailureReason?: string;
};
