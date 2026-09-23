export type TranscriptMarker = {
  recallTranscriptId: string | null;
  status: 'PENDING' | 'FAILED' | 'EMPTY';
  requestedAt?: string;
  subCode?: string | null;
};
