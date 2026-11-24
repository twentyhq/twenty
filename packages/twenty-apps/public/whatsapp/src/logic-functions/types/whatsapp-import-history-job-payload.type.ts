export type WhatsappImportHistoryJobPayload = {
  connectedAccountId: string;
  runId: string;
  chunkIndex: number;
  resumeIndex?: number;
};
