export const getWhatsappPlanHistoryImportJobId = ({
  runId,
  continuationIndex = 0,
}: {
  runId: string;
  continuationIndex?: number;
}): string => `whatsapp-history-plan-${runId}-${continuationIndex}`;

export const getWhatsappImportHistoryJobId = ({
  runId,
  chunkIndex,
  resumeIndex = 0,
}: {
  runId: string;
  chunkIndex: number;
  resumeIndex?: number;
}): string =>
  `whatsapp-history-chunk-${runId}-${chunkIndex}${resumeIndex > 0 ? `-resume-${resumeIndex}` : ''}`;
