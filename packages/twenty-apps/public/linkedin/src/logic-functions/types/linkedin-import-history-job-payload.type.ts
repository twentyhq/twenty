export type LinkedinImportHistoryJobPayload = {
  connectedAccountId: string;
  runId: string;
  pageIndex: number;
  // Omitted on the first page of a run, which starts with the first inbox
  inboxId?: string;
  cursor?: string;
};
