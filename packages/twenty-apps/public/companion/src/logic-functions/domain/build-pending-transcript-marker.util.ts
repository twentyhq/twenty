import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';

export const buildPendingTranscriptMarker = ({
  recallTranscriptId,
  requestedAt,
}: {
  recallTranscriptId: string | null;
  requestedAt: string;
}): TranscriptMarker => ({
  recallTranscriptId,
  status: 'PENDING',
  requestedAt,
});
