import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

// Shared by the webhook (push) and backstop convergence (pull) paths so both
// derive the same CallRecording status from a Recall bot status code.
export const mapRecallStatusCodeToCallRecordingStatus = (
  statusCode: string | undefined,
): CallRecordingStatus | undefined => {
  switch (statusCode) {
    case 'joining_call':
    case 'in_waiting_room':
      return CallRecordingStatus.JOINING;
    case 'in_call_not_recording':
    case 'recording_permission_allowed':
    case 'in_call_recording':
      return CallRecordingStatus.RECORDING;
    case 'call_ended':
    case 'analysis_done':
      return CallRecordingStatus.PROCESSING;
    case 'done':
      return CallRecordingStatus.COMPLETED;
    case 'fatal':
    case 'analysis_failed':
    case 'recording_permission_denied':
      return CallRecordingStatus.FAILED_UNKNOWN;
    default:
      return undefined;
  }
};
