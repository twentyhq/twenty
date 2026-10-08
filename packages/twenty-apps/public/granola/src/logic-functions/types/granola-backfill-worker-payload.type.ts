export type GranolaBackfillWorkerPayload = {
  registrationId: string;
  createdAfter?: string;
  updatedAfter?: string;
  folderId?: string;
  cursor?: string;
  pageIndex: number;
  runDay: string;
  retryAttempt?: number;
};
