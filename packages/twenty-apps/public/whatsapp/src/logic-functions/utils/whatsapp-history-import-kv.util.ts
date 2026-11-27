import { kv } from 'twenty-sdk/logic-function';

import { type WhatsappHistoryImportChatProgress } from 'src/logic-functions/types/whatsapp-history-import-chat-progress.type';
import { type WhatsappHistoryImportPlanning } from 'src/logic-functions/types/whatsapp-history-import-planning.type';
import { type WhatsappLegacyHistoryImportPlanning } from 'src/logic-functions/types/whatsapp-legacy-history-import-planning.type';

type WhatsappHistoryImportRun = { connectedAccountId: string; runId: string };

type WhatsappHistoryImportChat = WhatsappHistoryImportRun & { chatId: string };

const getPlanningKey = ({
  connectedAccountId,
  runId,
}: WhatsappHistoryImportRun): string =>
  `whatsapp-history-import-planning:${connectedAccountId}:${runId}`;

const getChatProgressKey = ({
  connectedAccountId,
  runId,
  chatId,
}: WhatsappHistoryImportChat): string =>
  `whatsapp-history-import-chat:${connectedAccountId}:${runId}:${chatId}`;

export const getWhatsappHistoryImportPlanning = async (
  run: WhatsappHistoryImportRun,
): Promise<WhatsappHistoryImportPlanning> =>
  (await kv.get<WhatsappHistoryImportPlanning>(getPlanningKey(run))) ?? {};

export const saveWhatsappHistoryImportPlanning = ({
  planning,
  ...run
}: WhatsappHistoryImportRun & {
  planning: WhatsappHistoryImportPlanning;
}): Promise<void> => kv.set(getPlanningKey(run), planning);

export const getWhatsappHistoryImportChatProgress = (
  chat: WhatsappHistoryImportChat,
): Promise<WhatsappHistoryImportChatProgress | null> =>
  kv.get<WhatsappHistoryImportChatProgress>(getChatProgressKey(chat));

export const saveWhatsappHistoryImportChatProgress = ({
  progress,
  ...chat
}: WhatsappHistoryImportChat & {
  progress: WhatsappHistoryImportChatProgress;
}): Promise<void> => kv.set(getChatProgressKey(chat), progress);

// Runs started before 0.3 stored their progress and listed chats in chunk keys
const getLegacyKeys = (
  run: WhatsappHistoryImportRun,
  { chunkCount, plannedChunkCount }: WhatsappLegacyHistoryImportPlanning,
): string[] => [
  `whatsapp-history-import-progress:${run.connectedAccountId}:${run.runId}`,
  ...Array.from(
    { length: chunkCount ?? plannedChunkCount ?? 0 },
    (_, chunkIndex) =>
      `whatsapp-history-import-chats:${run.connectedAccountId}:${run.runId}:${chunkIndex}`,
  ),
];

export const deleteWhatsappHistoryImportData = async (
  run: WhatsappHistoryImportRun,
): Promise<void> => {
  const planning =
    (await kv.get<
      WhatsappHistoryImportPlanning & WhatsappLegacyHistoryImportPlanning
    >(getPlanningKey(run))) ?? {};
  const { chatIds = [] } = planning;

  await Promise.all([
    ...chatIds.map((chatId) =>
      kv.delete(getChatProgressKey({ ...run, chatId })),
    ),
    ...getLegacyKeys(run, planning).map((key) => kv.delete(key)),
  ]);
  await kv.delete(getPlanningKey(run));
};
