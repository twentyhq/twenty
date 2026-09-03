export type FathomBackfillWorkerPayload = {
  connectedAccountId: string;
  days?: number;
  createdAfter?: string;
  cursor?: string;
  pageIndex?: number;
};
