export type WhatsappLegacyImportHistoryJobPayload = {
  connectedAccountId: string;
  runId: string;
  chunkIndex: number;
  resumeIndex?: number;
};
