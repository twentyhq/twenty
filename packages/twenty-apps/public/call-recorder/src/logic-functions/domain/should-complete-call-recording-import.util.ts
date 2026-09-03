import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/is-unavailable-call-recording-status.util';
import { isCallRecordingImportComplete } from 'src/logic-functions/domain/is-call-recording-import-complete.util';

export const shouldCompleteCallRecordingImport = ({
  status,
  startedAt,
  endedAt,
  transcript,
  audio,
  video,
  callRecorderFailureReason,
}: {
  status?: string;
  startedAt?: string;
  endedAt?: string;
  transcript?: unknown;
  audio?: FilesFieldValue;
  video?: FilesFieldValue;
  callRecorderFailureReason?: string | null;
}): boolean =>
  status !== CallRecordingStatus.COMPLETED &&
  !isUnavailableCallRecordingStatus(status) &&
  computeCallRecordingCharge({ startedAt, endedAt }) !== undefined &&
  isCallRecordingImportComplete({
    transcript,
    audio,
    video,
    callRecorderFailureReason,
  });
