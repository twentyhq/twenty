import { isNonEmptyArray } from '@sniptt/guards';
import { type FilesFieldValue } from 'src/logic-functions/types/FilesFieldValue';
import { parseMediaFileTooLargeMarkers } from 'src/logic-functions/domain/utils/parseMediaFileTooLargeMarkers';

export const isCallRecordingMediaImportComplete = ({
  audio,
  video,
  companionFailureReason,
  requiresVideo = true,
}: {
  requiresVideo?: boolean;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
  companionFailureReason: string | null | undefined;
}): boolean => {
  const { audioFileTooLarge, videoFileTooLarge } =
    parseMediaFileTooLargeMarkers(companionFailureReason);

  return (
    (isNonEmptyArray(audio) || audioFileTooLarge) &&
    (!requiresVideo || isNonEmptyArray(video) || videoFileTooLarge)
  );
};
