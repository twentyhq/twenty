import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';

import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';

export const hasStoredCallRecordingArtifact = ({
  transcript,
  audio,
  video,
}: {
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
}): boolean =>
  isNonEmptyArray(audio) ||
  isNonEmptyArray(video) ||
  (!isNull(transcript) &&
    !isUndefined(transcript) &&
    isUndefined(parseTranscriptMarker(transcript)));
