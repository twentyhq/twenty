// A marker in the transcript field is the request-once double-billing guard.
export type RecallTranscriptMarker = {
  recallTranscriptId: string | null;
  status: 'PENDING' | 'FAILED';
  requestedAt?: string;
  subCode?: string | null;
};
