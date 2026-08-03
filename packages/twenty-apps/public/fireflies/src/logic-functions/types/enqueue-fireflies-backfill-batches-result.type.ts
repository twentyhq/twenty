export type EnqueueFirefliesBackfillBatchesResult =
  | {
      success: true;
      enqueuedBatchCount: number;
    }
  | {
      success: false;
      enqueuedBatchCount: number;
      errorMessage: string;
    };
