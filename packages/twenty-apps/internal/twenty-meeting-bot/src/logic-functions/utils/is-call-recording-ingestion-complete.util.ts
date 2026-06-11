import { isNonEmptyArray } from '@sniptt/guards';

import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { parseRecallTranscriptMarker } from 'src/logic-functions/utils/parse-recall-transcript-marker.util';

export const isCallRecordingIngestionComplete = ({
  transcript,
  audio,
  video,
}: {
  transcript: unknown;
  audio: FilesFieldValue | null | undefined;
  video: FilesFieldValue | null | undefined;
}): boolean =>
  transcript !== null &&
  transcript !== undefined &&
  parseRecallTranscriptMarker(transcript) === null &&
  isNonEmptyArray(audio) &&
  isNonEmptyArray(video);
