export const getLinkedinPlanHistoryImportJobId = ({
  runId,
  continuationIndex = 0,
}: {
  runId: string;
  continuationIndex?: number;
}): string => `linkedin-history-plan-${runId}-${continuationIndex}`;

export const getLinkedinImportHistoryJobId = ({
  runId,
  chunkIndex,
}: {
  runId: string;
  chunkIndex: number;
}): string => `linkedin-history-chunk-${runId}-${chunkIndex}`;
