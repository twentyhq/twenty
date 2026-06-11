import { type RecallTranscriptMarker } from 'src/logic-functions/types/recall-transcript-marker.type';

export const buildFailedRecallTranscriptMarker = ({
  recallTranscriptId,
  subCode,
}: {
  recallTranscriptId: string | null;
  subCode: string | null;
}): RecallTranscriptMarker => ({
  recallTranscriptId,
  status: 'FAILED',
  subCode,
});
