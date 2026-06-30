import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';

export const isCallRecordingIngestionComplete = ({
  transcript,
  audio,
  video,
}: {
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
}): boolean =>
  !isNull(transcript) &&
  !isUndefined(transcript) &&
  isUndefined(parseTranscriptMarker(transcript)) &&
  isNonEmptyArray(audio) &&
  isNonEmptyArray(video);
