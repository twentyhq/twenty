import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { isNotRecordedRecallSubCode } from 'src/logic-functions/domain/is-not-recorded-recall-sub-code.util';

export const mapRecallStatusCodeToCallRecordingStatus = ({
  statusCode,
  statusSubCode,
}: {
  statusCode: string | undefined;
  statusSubCode?: string | undefined;
}): CallRecordingStatus | undefined => {
  // Recall defines no-capture sub codes only on call_ended and fatal; other codes may carry a stale bot-level sub code.
  if (
    (statusCode === 'call_ended' || statusCode === 'fatal') &&
    isNotRecordedRecallSubCode(statusSubCode)
  ) {
    return CallRecordingStatus.NOT_RECORDED;
  }

  switch (statusCode) {
    case 'joining_call':
    case 'in_waiting_room':
      return CallRecordingStatus.JOINING;
    case 'in_call_not_recording':
    case 'recording_permission_allowed':
    case 'in_call_recording':
      return CallRecordingStatus.RECORDING;
    // 'done' stays PROCESSING: COMPLETED is set only after all artifacts are imported.
    case 'call_ended':
    case 'analysis_done':
    case 'done':
      return CallRecordingStatus.PROCESSING;
    case 'fatal':
    case 'analysis_failed':
    case 'recording_permission_denied':
      return CallRecordingStatus.FAILED;
    default:
      return undefined;
  }
};
