export type TranscriptMarker = {
  recallTranscriptId: string | null;
  status: 'PENDING' | 'FAILED';
  requestedAt?: string;
  subCode?: string | null;
};
