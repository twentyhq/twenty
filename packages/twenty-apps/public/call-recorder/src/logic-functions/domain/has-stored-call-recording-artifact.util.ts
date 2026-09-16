import { isNonEmptyArray, isUndefined } from '@sniptt/guards';

import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { isDefined } from 'src/logic-functions/utils/is-defined.util';

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
  (isDefined(transcript) && isUndefined(parseTranscriptMarker(transcript)));
