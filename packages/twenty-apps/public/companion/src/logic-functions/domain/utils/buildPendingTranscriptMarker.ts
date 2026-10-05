import { type TranscriptMarker } from 'src/logic-functions/types/TranscriptMarker';

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
