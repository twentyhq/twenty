export type TeamsTranscriptHistoryJobPayload = {
  connectedAccountId: string;
  runId: string;
  pageIndex: number;
  attempt: number;
  nextPageUrl?: string;
};
