// A marker occupies the transcript RAW_JSON field while the async transcript
// is processing (or after it failed); its presence is the request-once guard
// that prevents double-billing Recall transcription. Real transcript content
// never carries a marker status, so parse returning null means "actual
// transcript or empty", never "in flight".
export type RecallTranscriptMarker = {
  recallTranscriptId: string | null;
  status: 'PENDING' | 'FAILED';
  requestedAt?: string;
  subCode?: string | null;
};

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
