import { isUndefined } from '@sniptt/guards';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type SummaryUnavailableCallRecording = {
  status: string | null;
  callRecorderFailureReason: string | null;
};

const RECORDING_PROCESSING_REASON =
  'The recording is still being processed. The summary will appear here once it is ready.';
const RECORDING_IN_PROGRESS_REASON =
  'The recording is in progress. The summary will be available once the call ends.';
const RECORDING_SCHEDULED_REASON =
  'The recording is scheduled. The summary will be available once the call has been recorded.';
const RECORDING_FAILED_REASON =
  'The recording failed, so no summary could be generated.';

const hasStatus = (
  callRecordings: SummaryUnavailableCallRecording[],
  status: CallRecordingStatus,
): boolean =>
  callRecordings.some((callRecording) => callRecording.status === status);

// Explains why no summary is available, derived from the call recordings' lifecycle.
// In-progress states take precedence over a failed attempt (a retry may be under way).
// Returns undefined when the reason is unknown, so the caller keeps the default empty state.
export const getSummaryUnavailableReason = (
  callRecordings: SummaryUnavailableCallRecording[],
): string | undefined => {
  if (hasStatus(callRecordings, CallRecordingStatus.PROCESSING)) {
    return RECORDING_PROCESSING_REASON;
  }

  if (
    hasStatus(callRecordings, CallRecordingStatus.RECORDING) ||
    hasStatus(callRecordings, CallRecordingStatus.JOINING)
  ) {
    return RECORDING_IN_PROGRESS_REASON;
  }

  if (hasStatus(callRecordings, CallRecordingStatus.SCHEDULED)) {
    return RECORDING_SCHEDULED_REASON;
  }

  const failedCallRecording = callRecordings.find(
    (callRecording) => callRecording.status === CallRecordingStatus.FAILED,
  );

  if (!isUndefined(failedCallRecording)) {
    const failureReason = failedCallRecording.callRecorderFailureReason;

    return isNonEmptyString(failureReason)
      ? `${RECORDING_FAILED_REASON} Reason: ${failureReason.trim()}`
      : RECORDING_FAILED_REASON;
  }

  return undefined;
};
