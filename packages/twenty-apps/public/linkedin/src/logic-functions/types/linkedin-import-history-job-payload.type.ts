export type LinkedinImportHistoryJobPayload = {
  connectedAccountId: string;
  runId: string;
  chunkIndex: number;
  resumeIndex?: number;
};
