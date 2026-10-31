import { kv } from 'twenty-sdk/logic-function';

import { type LinkedinHistoryImportPlanning } from 'src/logic-functions/types/linkedin-history-import-planning.type';
import { type LinkedinHistoryImportProgress } from 'src/logic-functions/types/linkedin-history-import-progress.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

type LinkedinHistoryImportRun = { connectedAccountId: string; runId: string };

const EMPTY_PROGRESS: LinkedinHistoryImportProgress = {
  completedChunkCount: 0,
  completedConversationCount: 0,
  importedConversationCount: 0,
  currentChunkProcessedCount: 0,
};

const EMPTY_PLANNING: LinkedinHistoryImportPlanning = {
  plannedChunkCount: 0,
  plannedConversationCount: 0,
};

const getPlanningKey = ({
  connectedAccountId,
  runId,
}: LinkedinHistoryImportRun): string =>
  `linkedin-history-import-planning:${connectedAccountId}:${runId}`;

export const getLinkedinHistoryImportPlanning = async (
  run: LinkedinHistoryImportRun,
): Promise<LinkedinHistoryImportPlanning> =>
  (await kv.get<LinkedinHistoryImportPlanning>(getPlanningKey(run))) ??
  EMPTY_PLANNING;

export const saveLinkedinHistoryImportPlanning = ({
  planning,
  ...run
}: LinkedinHistoryImportRun & {
  planning: LinkedinHistoryImportPlanning;
}): Promise<void> => kv.set(getPlanningKey(run), planning);

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

export const deleteLinkedinHistoryImportData = async (
  run: LinkedinHistoryImportRun,
): Promise<void> => {
  const planning = await getLinkedinHistoryImportPlanning(run);
  const chunkCount = planning.chunkCount ?? planning.plannedChunkCount;

  await Promise.all([
    kv.delete(getProgressKey(run)),
    kv.delete(getPlanningKey(run)),
    ...Array.from({ length: chunkCount }, (_, chunkIndex) =>
      kv.delete(getChunkChatsKey({ ...run, chunkIndex })),
    ),
  ]);
};
