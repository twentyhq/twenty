import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { parseMediaFileTooLargeMarkers } from 'src/logic-functions/domain/parse-media-file-too-large-markers.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';

export const isCallRecordingIngestionComplete = ({
  transcript,
  audio,
  video,
  callRecorderFailureReason,
}: {
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
  callRecorderFailureReason: string | null | undefined;
}): boolean => {
  // An artifact skipped for size counts as resolved: Recall produced it, but it
  // cannot be ingested until uploads stream instead of buffering in memory.
  const { audioFileTooLarge, videoFileTooLarge } = parseMediaFileTooLargeMarkers(
    callRecorderFailureReason,
  );

  return (
    !isNull(transcript) &&
    !isUndefined(transcript) &&
    isUndefined(parseTranscriptMarker(transcript)) &&
    (isNonEmptyArray(audio) || audioFileTooLarge) &&
    (isNonEmptyArray(video) || videoFileTooLarge)
  );
};
