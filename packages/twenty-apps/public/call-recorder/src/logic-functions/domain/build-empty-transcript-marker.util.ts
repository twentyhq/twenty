import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';

export const buildEmptyTranscriptMarker = ({
  recallTranscriptId,
}: {
  recallTranscriptId: string;
}): TranscriptMarker => ({
  recallTranscriptId,
  status: 'EMPTY',
});
