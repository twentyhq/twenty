import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

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
    // 'done' stays PROCESSING: COMPLETED is set only after all artifacts are ingested.
    case 'call_ended':
    case 'analysis_done':
    case 'done':
      return CallRecordingStatus.PROCESSING;
    case 'fatal':
    case 'analysis_failed':
    case 'recording_permission_denied':
      return CallRecordingStatus.FAILED_UNKNOWN;
    default:
      return undefined;
  }
};
