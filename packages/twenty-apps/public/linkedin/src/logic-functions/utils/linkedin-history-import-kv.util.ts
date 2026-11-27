import { kv } from 'twenty-sdk/logic-function';

import { type LinkedinHistoryImportChatProgress } from 'src/logic-functions/types/linkedin-history-import-chat-progress.type';
import { type LinkedinHistoryImportPlanning } from 'src/logic-functions/types/linkedin-history-import-planning.type';
import { type LinkedinLegacyHistoryImportPlanning } from 'src/logic-functions/types/linkedin-legacy-history-import-planning.type';

type LinkedinHistoryImportRun = { connectedAccountId: string; runId: string };

type LinkedinHistoryImportChat = LinkedinHistoryImportRun & { chatId: string };

const getPlanningKey = ({
  connectedAccountId,
  runId,
}: LinkedinHistoryImportRun): string =>
  `linkedin-history-import-planning:${connectedAccountId}:${runId}`;

const getChatProgressKey = ({
  connectedAccountId,
  runId,
  chatId,
}: LinkedinHistoryImportChat): string =>
  `linkedin-history-import-chat:${connectedAccountId}:${runId}:${chatId}`;

export const getLinkedinHistoryImportPlanning = async (
  run: LinkedinHistoryImportRun,
): Promise<LinkedinHistoryImportPlanning> =>
  (await kv.get<LinkedinHistoryImportPlanning>(getPlanningKey(run))) ?? {};

export const saveLinkedinHistoryImportPlanning = ({
  planning,
  ...run
}: LinkedinHistoryImportRun & {
  planning: LinkedinHistoryImportPlanning;
}): Promise<void> => kv.set(getPlanningKey(run), planning);

export const getLinkedinHistoryImportChatProgress = (
  chat: LinkedinHistoryImportChat,
): Promise<LinkedinHistoryImportChatProgress | null> =>
  kv.get<LinkedinHistoryImportChatProgress>(getChatProgressKey(chat));

export const saveLinkedinHistoryImportChatProgress = ({
  progress,
  ...chat
}: LinkedinHistoryImportChat & {
  progress: LinkedinHistoryImportChatProgress;
}): Promise<void> => kv.set(getChatProgressKey(chat), progress);

// Runs started before 0.9 stored their progress and listed chats in chunk keys
const getLegacyKeys = ({
  run,
  planning: { chunkCount, plannedChunkCount },
}: {
  run: LinkedinHistoryImportRun;
  planning: LinkedinLegacyHistoryImportPlanning;
}): string[] => [
  `linkedin-history-import-progress:${run.connectedAccountId}:${run.runId}`,
  ...Array.from(
    { length: chunkCount ?? plannedChunkCount ?? 0 },
    (_, chunkIndex) =>
      `linkedin-history-import-chats:${run.connectedAccountId}:${run.runId}:${chunkIndex}`,
  ),
];

export const deleteLinkedinHistoryImportData = async (
  run: LinkedinHistoryImportRun,
): Promise<void> => {
  const planning =
    (await kv.get<
      LinkedinHistoryImportPlanning & LinkedinLegacyHistoryImportPlanning
    >(getPlanningKey(run))) ?? {};
  const { chatIds = [] } = planning;

  await Promise.all([
    ...chatIds.map((chatId) =>
      kv.delete(getChatProgressKey({ ...run, chatId })),
    ),
    ...getLegacyKeys({ run, planning }).map((key) => kv.delete(key)),
  ]);
  await kv.delete(getPlanningKey(run));
};
