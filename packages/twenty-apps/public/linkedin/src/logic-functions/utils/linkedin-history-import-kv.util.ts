import { kv } from 'twenty-sdk/logic-function';

import { type LinkedinHistoryImportChatProgress } from 'src/logic-functions/types/linkedin-history-import-chat-progress.type';
import { type LinkedinHistoryImportPlanning } from 'src/logic-functions/types/linkedin-history-import-planning.type';

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

export const deleteLinkedinHistoryImportData = async (
  run: LinkedinHistoryImportRun,
): Promise<void> => {
  const { chatIds = [] } = await getLinkedinHistoryImportPlanning(run);

  await Promise.all([
    kv.delete(getPlanningKey(run)),
    ...chatIds.map((chatId) =>
      kv.delete(getChatProgressKey({ ...run, chatId })),
    ),
  ]);
};
