import { isNonEmptyArray } from '@sniptt/guards';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { parseMediaFileTooLargeMarkers } from 'src/logic-functions/domain/parse-media-file-too-large-markers.util';

export const isCallRecordingImportComplete = ({
  transcript,
  audio,
  video,
  companionFailureReason,
  requiresVideo = true,
}: {
  requiresVideo?: boolean;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
  companionFailureReason: string | null | undefined;
}): boolean => {
  const { audioFileTooLarge, videoFileTooLarge } =
    parseMediaFileTooLargeMarkers(companionFailureReason);

  return (
    Array.isArray(transcript) &&
    (isNonEmptyArray(audio) || audioFileTooLarge) &&
    (!requiresVideo || isNonEmptyArray(video) || videoFileTooLarge)
  );
};
