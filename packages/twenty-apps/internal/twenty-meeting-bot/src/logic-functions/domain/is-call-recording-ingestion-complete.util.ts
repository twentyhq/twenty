import { isNonEmptyArray, isNull, isUndefined } from '@sniptt/guards';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { parseRecallTranscriptMarker } from 'src/logic-functions/domain/parse-recall-transcript-marker.util';

export const isCallRecordingIngestionComplete = ({
  transcript,
  audio,
  video,
}: {
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
}): boolean =>
  // RAW_JSON can hold a literal JSON null; both nullish forms mean "no transcript".
  !isNull(transcript) &&
  !isUndefined(transcript) &&
  isUndefined(parseRecallTranscriptMarker(transcript)) &&
  isNonEmptyArray(audio) &&
  isNonEmptyArray(video);
