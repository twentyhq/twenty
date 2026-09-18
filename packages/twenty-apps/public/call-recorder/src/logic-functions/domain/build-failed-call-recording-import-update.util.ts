import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { hasStoredCallRecordingArtifact } from 'src/logic-functions/domain/has-stored-call-recording-artifact.util';
import { isCallRecordingImportComplete } from 'src/logic-functions/domain/is-call-recording-import-complete.util';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/is-unavailable-call-recording-status.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Every artifact is resolved but none was stored: completing would show an empty recording.
export const buildFailedCallRecordingImportUpdate = ({
  status,
  transcript,
  audio,
  video,
  callRecorderFailureReason,
}: {
  status: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
  callRecorderFailureReason: string | undefined;
}):
  | { status: CallRecordingStatus.FAILED; callRecorderFailureReason: string }
  | undefined => {
  if (
    status === CallRecordingStatus.COMPLETED ||
    isUnavailableCallRecordingStatus(status) ||
    !isNonEmptyString(callRecorderFailureReason) ||
    hasStoredCallRecordingArtifact({ transcript, audio, video }) ||
    !isCallRecordingImportComplete({
      transcript,
      audio,
      video,
      callRecorderFailureReason,
    })
  ) {
    return undefined;
  }

  return { status: CallRecordingStatus.FAILED, callRecorderFailureReason };
};
