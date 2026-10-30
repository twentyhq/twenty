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
  resumeIndex = 0,
}: {
  runId: string;
  chunkIndex: number;
  resumeIndex?: number;
}): string =>
  `linkedin-history-chunk-${runId}-${chunkIndex}${resumeIndex > 0 ? `-resume-${resumeIndex}` : ''}`;
