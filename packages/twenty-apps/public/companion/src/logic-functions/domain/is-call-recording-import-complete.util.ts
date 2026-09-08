import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { parseMediaFileTooLargeMarkers } from 'src/logic-functions/domain/parse-media-file-too-large-markers.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';

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
    !isNull(transcript) &&
    !isUndefined(transcript) &&
    (isUndefined(parseTranscriptMarker(transcript)) ||
      parseTranscriptMarker(transcript)?.status === 'FAILED') &&
    (isNonEmptyArray(audio) || audioFileTooLarge) &&
    (!requiresVideo || isNonEmptyArray(video) || videoFileTooLarge)
  );
};
