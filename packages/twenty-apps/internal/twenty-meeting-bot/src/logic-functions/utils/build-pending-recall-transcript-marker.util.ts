import { type RecallTranscriptMarker } from 'src/logic-functions/types/recall-transcript-marker.type';

export const buildPendingRecallTranscriptMarker = ({
  recallTranscriptId,
  requestedAt,
}: {
  recallTranscriptId: string;
  requestedAt: string;
}): RecallTranscriptMarker => ({
  recallTranscriptId,
  status: 'PENDING',
  requestedAt,
});
