import { type RecallTranscriptMarker } from 'src/logic-functions/types/recall-transcript-marker.type';

// Real transcript content never carries a marker status, so null means "actual transcript or empty".
export const parseRecallTranscriptMarker = (
  transcript: unknown,
): RecallTranscriptMarker | null => {
  if (
    typeof transcript !== 'object' ||
    transcript === null ||
    Array.isArray(transcript)
  ) {
    return null;
  }

  const candidate = transcript as Record<string, unknown>;

  if (candidate.status !== 'PENDING' && candidate.status !== 'FAILED') {
    return null;
  }

  return {
    recallTranscriptId:
      typeof candidate.recallTranscriptId === 'string'
        ? candidate.recallTranscriptId
        : null,
    status: candidate.status,
    ...(typeof candidate.requestedAt === 'string'
      ? { requestedAt: candidate.requestedAt }
      : {}),
    ...(typeof candidate.subCode === 'string'
      ? { subCode: candidate.subCode }
      : {}),
  };
};
