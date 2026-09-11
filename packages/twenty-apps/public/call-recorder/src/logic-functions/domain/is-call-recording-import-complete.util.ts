import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { parseUnrecoverableMediaMarkers } from 'src/logic-functions/domain/parse-unrecoverable-media-markers.util';

export const isCallRecordingImportComplete = ({
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
  const { isAudioUnrecoverable, isVideoUnrecoverable } =
    parseUnrecoverableMediaMarkers(callRecorderFailureReason);
  const transcriptMarker = parseTranscriptMarker(transcript);

  return (
    !isNull(transcript) &&
    !isUndefined(transcript) &&
    (isUndefined(transcriptMarker) || transcriptMarker.status === 'EMPTY') &&
    (isNonEmptyArray(audio) || isAudioUnrecoverable) &&
    (isNonEmptyArray(video) || isVideoUnrecoverable)
  );
};
