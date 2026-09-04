import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';

// A canceled request never sent a bot; every other recording, including a
// manual one without a request status, means the recorder was involved.
export const hasCallRecordingAttempt = (
  callRecordings: CallRecordingRecord[],
): boolean =>
  callRecordings.some(
    (callRecording) =>
      callRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.CANCELED,
  );
