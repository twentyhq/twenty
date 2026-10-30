export const getLinkedinHistoryImportChunkKvKey = ({
  connectedAccountId,
  runId,
  chunkIndex,
}: {
  connectedAccountId: string;
  runId: string;
  chunkIndex: number;
}): string =>
  `linkedin-history-import-chunk:${connectedAccountId}:${runId}:${chunkIndex}`;
