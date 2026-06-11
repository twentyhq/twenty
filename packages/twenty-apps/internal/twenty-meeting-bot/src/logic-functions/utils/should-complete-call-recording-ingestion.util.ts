import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { isCallRecordingIngestionComplete } from 'src/logic-functions/utils/is-call-recording-ingestion-complete.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/utils/update-call-recording.util';

export const shouldCompleteCallRecordingIngestion = ({
  current,
  updateData,
}: {
  current: {
    status?: string | null;
    transcript?: unknown;
    audio?: FilesFieldValue | null;
    video?: FilesFieldValue | null;
  };
  updateData: CallRecordingUpdateFields;
}): boolean =>
  current.status !== CallRecordingStatus.COMPLETED &&
  isCallRecordingIngestionComplete({
    transcript: updateData.transcript ?? current.transcript,
    audio: updateData.audio ?? current.audio,
    video: updateData.video ?? current.video,
  });
