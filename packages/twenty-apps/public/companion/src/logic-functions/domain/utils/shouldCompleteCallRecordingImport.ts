import { isDesktopAudioRecording } from 'src/logic-functions/domain/utils/isDesktopAudioRecording';
import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { type FilesFieldValue } from 'src/logic-functions/types/FilesFieldValue';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/utils/computeCallRecordingCharge';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/utils/isUnavailableCallRecordingStatus';
import { isCallRecordingImportComplete } from 'src/logic-functions/domain/utils/isCallRecordingImportComplete';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/CallRecordingUpdateFields';

export const shouldCompleteCallRecordingImport = ({
  current,
  updateData,
}: {
  current: {
    companionSession?: unknown;
    status?: string;
    startedAt?: string;
    endedAt?: string;
    transcript?: unknown;
    audio?: FilesFieldValue;
    video?: FilesFieldValue;
    companionFailureReason?: string | null;
  };
  updateData: CallRecordingUpdateFields;
}): boolean =>
  current.status !== CallRecordingStatus.COMPLETED &&
  !isUnavailableCallRecordingStatus(current.status) &&
  !isUnavailableCallRecordingStatus(updateData.status) &&
  computeCallRecordingCharge({
    startedAt: updateData.startedAt ?? current.startedAt,
    endedAt: updateData.endedAt ?? current.endedAt,
  }) !== undefined &&
  isCallRecordingImportComplete({
    requiresVideo: !isDesktopAudioRecording(current.companionSession),
    transcript: updateData.transcript ?? current.transcript,
    audio: updateData.audio ?? current.audio,
    video: updateData.video ?? current.video,
    companionFailureReason:
      updateData.companionFailureReason ?? current.companionFailureReason,
  });
