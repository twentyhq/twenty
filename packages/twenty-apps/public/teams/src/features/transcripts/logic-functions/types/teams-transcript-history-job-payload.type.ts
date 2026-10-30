export type TeamsTranscriptHistoryJobPayload = {
  connectedAccountId: string;
  runId: string;
  chunkIndex: number;
  pageIndex: number;
  attempt: number;
  nextPageUrl?: string;
};
