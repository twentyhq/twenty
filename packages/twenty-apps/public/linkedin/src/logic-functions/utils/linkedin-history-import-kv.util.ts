import { kv } from 'twenty-sdk/logic-function';

import { type LinkedinHistoryImportProgress } from 'src/logic-functions/types/linkedin-history-import-progress.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

type LinkedinHistoryImportRun = { connectedAccountId: string; runId: string };

const EMPTY_PROGRESS: LinkedinHistoryImportProgress = {
  completedChunkCount: 0,
  completedConversationCount: 0,
  importedConversationCount: 0,
  currentChunkProcessedCount: 0,
};

const getChunkChatsKey = ({
  connectedAccountId,
  runId,
  chunkIndex,
}: LinkedinHistoryImportRun & { chunkIndex: number }): string =>
  `linkedin-history-import-chats:${connectedAccountId}:${runId}:${chunkIndex}`;

const getProgressKey = ({
  connectedAccountId,
  runId,
}: LinkedinHistoryImportRun): string =>
  `linkedin-history-import-progress:${connectedAccountId}:${runId}`;

export const getLinkedinHistoryImportChunkChats = (
  chunk: LinkedinHistoryImportRun & { chunkIndex: number },
): Promise<UnipileChat[] | null> =>
  kv.get<UnipileChat[]>(getChunkChatsKey(chunk));

export const saveLinkedinHistoryImportChunkChats = ({
  chats,
  ...chunk
}: LinkedinHistoryImportRun & {
  chunkIndex: number;
  chats: UnipileChat[];
}): Promise<void> => kv.set(getChunkChatsKey(chunk), chats);

export const getLinkedinHistoryImportProgress = async (
  run: LinkedinHistoryImportRun,
): Promise<LinkedinHistoryImportProgress> =>
  (await kv.get<LinkedinHistoryImportProgress>(getProgressKey(run))) ??
  EMPTY_PROGRESS;

export const saveLinkedinHistoryImportProgress = ({
  progress,
  ...run
}: LinkedinHistoryImportRun & {
  progress: LinkedinHistoryImportProgress;
}): Promise<void> => kv.set(getProgressKey(run), progress);

export const deleteLinkedinHistoryImportData = async ({
  chunkCount,
  ...run
}: LinkedinHistoryImportRun & { chunkCount: number }): Promise<void> => {
  await Promise.all([
    kv.delete(getProgressKey(run)),
    ...Array.from({ length: chunkCount }, (_, chunkIndex) =>
      kv.delete(getChunkChatsKey({ ...run, chunkIndex })),
    ),
  ]);
};
