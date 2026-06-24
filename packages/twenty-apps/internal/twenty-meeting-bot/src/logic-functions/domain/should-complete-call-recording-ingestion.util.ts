import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';
import { isCallRecordingIngestionComplete } from 'src/logic-functions/domain/is-call-recording-ingestion-complete.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/data/update-call-recording.util';

export const shouldCompleteCallRecordingIngestion = ({
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
  isCallRecordingIngestionComplete({
    transcript: updateData.transcript ?? current.transcript,
    audio: updateData.audio ?? current.audio,
    video: updateData.video ?? current.video,
  });
