export type LinkedinPlanHistoryImportJobPayload = {
  connectedAccountId: string;
  runId: string;
  continuationIndex?: number;
  inboxIndex?: number;
  cursor?: string;
  plannedChunkCount?: number;
  plannedConversationCount?: number;
};
