import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';

export const buildFailedTranscriptMarker = ({
  recallTranscriptId,
  subCode,
}: {
  recallTranscriptId: string | null;
  subCode: string | null;
}): TranscriptMarker => ({
  recallTranscriptId,
  status: 'FAILED',
  subCode,
});
