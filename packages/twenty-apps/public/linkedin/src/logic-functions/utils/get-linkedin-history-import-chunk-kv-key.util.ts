export const getLinkedinHistoryImportChunkKvKey = ({
  connectedAccountId,
  runId,
  chunkIndex,
  kind = 'result',
}: {
  connectedAccountId: string;
  runId: string;
  chunkIndex: number;
  kind?: 'result' | 'progress';
}): string =>
  `linkedin-history-import-chunk${kind === 'progress' ? '-progress' : ''}:${connectedAccountId}:${runId}:${chunkIndex}`;
