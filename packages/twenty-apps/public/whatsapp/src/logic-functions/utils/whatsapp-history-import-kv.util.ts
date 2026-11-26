import { kv } from 'twenty-sdk/logic-function';

import { type WhatsappHistoryImportPlanning } from 'src/logic-functions/types/whatsapp-history-import-planning.type';
import { type WhatsappHistoryImportProgress } from 'src/logic-functions/types/whatsapp-history-import-progress.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';

type WhatsappHistoryImportRun = { connectedAccountId: string; runId: string };

const EMPTY_PROGRESS: WhatsappHistoryImportProgress = {
  completedChunkCount: 0,
  completedConversationCount: 0,
  importedConversationCount: 0,
  currentChunkProcessedCount: 0,
};

const EMPTY_PLANNING: WhatsappHistoryImportPlanning = {
  plannedChunkCount: 0,
  plannedConversationCount: 0,
};

const getPlanningKey = ({
  connectedAccountId,
  runId,
}: WhatsappHistoryImportRun): string =>
  `whatsapp-history-import-planning:${connectedAccountId}:${runId}`;

export const getWhatsappHistoryImportPlanning = async (
  run: WhatsappHistoryImportRun,
): Promise<WhatsappHistoryImportPlanning> =>
  (await kv.get<WhatsappHistoryImportPlanning>(getPlanningKey(run))) ??
  EMPTY_PLANNING;

export const saveWhatsappHistoryImportPlanning = ({
  planning,
  ...run
}: WhatsappHistoryImportRun & {
  planning: WhatsappHistoryImportPlanning;
}): Promise<void> => kv.set(getPlanningKey(run), planning);

const getChunkChatsKey = ({
  connectedAccountId,
  runId,
  chunkIndex,
}: WhatsappHistoryImportRun & { chunkIndex: number }): string =>
  `whatsapp-history-import-chats:${connectedAccountId}:${runId}:${chunkIndex}`;

const getProgressKey = ({
  connectedAccountId,
  runId,
}: WhatsappHistoryImportRun): string =>
  `whatsapp-history-import-progress:${connectedAccountId}:${runId}`;

export const getWhatsappHistoryImportChunkChats = (
  chunk: WhatsappHistoryImportRun & { chunkIndex: number },
): Promise<UnipileChat[] | null> =>
  kv.get<UnipileChat[]>(getChunkChatsKey(chunk));

export const saveWhatsappHistoryImportChunkChats = ({
  chats,
  ...chunk
}: WhatsappHistoryImportRun & {
  chunkIndex: number;
  chats: UnipileChat[];
}): Promise<void> => kv.set(getChunkChatsKey(chunk), chats);

export const getWhatsappHistoryImportProgress = async (
  run: WhatsappHistoryImportRun,
): Promise<WhatsappHistoryImportProgress> =>
  (await kv.get<WhatsappHistoryImportProgress>(getProgressKey(run))) ??
  EMPTY_PROGRESS;

export const saveWhatsappHistoryImportProgress = ({
  progress,
  ...run
}: WhatsappHistoryImportRun & {
  progress: WhatsappHistoryImportProgress;
}): Promise<void> => kv.set(getProgressKey(run), progress);

export const deleteWhatsappHistoryImportData = async (
  run: WhatsappHistoryImportRun,
): Promise<void> => {
  const planning = await getWhatsappHistoryImportPlanning(run);
  const chunkCount = planning.chunkCount ?? planning.plannedChunkCount;

  await Promise.all([
    kv.delete(getProgressKey(run)),
    kv.delete(getPlanningKey(run)),
    ...Array.from({ length: chunkCount }, (_, chunkIndex) =>
      kv.delete(getChunkChatsKey({ ...run, chunkIndex })),
    ),
  ]);
};
