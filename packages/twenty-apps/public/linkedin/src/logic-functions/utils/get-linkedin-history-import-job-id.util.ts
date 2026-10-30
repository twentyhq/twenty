export const getLinkedinPlanHistoryImportJobId = (runId: string): string =>
  `linkedin-history-plan-${runId}`;

export const getLinkedinImportHistoryJobId = ({
  runId,
  chunkIndex,
}: {
  runId: string;
  chunkIndex: number;
}): string => `linkedin-history-chunk-${runId}-${chunkIndex}`;
