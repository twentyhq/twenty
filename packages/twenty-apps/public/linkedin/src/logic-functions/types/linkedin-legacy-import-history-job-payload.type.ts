export type LinkedinLegacyImportHistoryJobPayload = {
  connectedAccountId: string;
  runId: string;
  chunkIndex: number;
  resumeIndex?: number;
};
