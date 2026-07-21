import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';
import { isCallRecordingImportComplete } from 'src/logic-functions/domain/is-call-recording-import-complete.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const shouldCompleteCallRecordingImport = ({
  current,
  updateData,
}: {
  current: {
    status?: string;
    startedAt?: string;
    endedAt?: string;
    transcript?: unknown;
    audio?: FilesFieldValue;
    video?: FilesFieldValue;
    callRecorderFailureReason?: string | null;
  };
  updateData: CallRecordingUpdateFields;
}): boolean =>
  current.status !== CallRecordingStatus.COMPLETED &&
  current.status !== CallRecordingStatus.FAILED &&
  updateData.status !== CallRecordingStatus.FAILED &&
  computeCallRecordingCharge({
    startedAt: updateData.startedAt ?? current.startedAt,
    endedAt: updateData.endedAt ?? current.endedAt,
  }) !== undefined &&
  isCallRecordingImportComplete({
    transcript: updateData.transcript ?? current.transcript,
    audio: updateData.audio ?? current.audio,
    video: updateData.video ?? current.video,
    callRecorderFailureReason:
      updateData.callRecorderFailureReason ?? current.callRecorderFailureReason,
  });
