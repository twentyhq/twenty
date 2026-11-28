import { createHash } from 'node:crypto';

import { type WhatsappHistoryImportChatJob } from 'src/logic-functions/types/whatsapp-history-import-chat-job.type';

const WHATSAPP_CHAT_ID_HASH_LENGTH = 32;

export const getWhatsappPlanHistoryImportJobId = ({
  runId,
  continuationIndex = 0,
}: {
  runId: string;
  continuationIndex?: number;
}): string => `whatsapp-history-plan-${runId}-${continuationIndex}`;

// Job ids only accept [\w.-] up to 128 characters, which Unipile chat ids do not respect
export const getWhatsappChatJobIdSegment = (chatId: string): string =>
  createHash('sha256')
    .update(chatId)
    .digest('hex')
    .slice(0, WHATSAPP_CHAT_ID_HASH_LENGTH);

export const getWhatsappHistoryImportChatJobId = ({
  kind,
  payload,
}: WhatsappHistoryImportChatJob): string => {
  const { runId, chat, attempt = 0 } = payload;
  const chatSegment = getWhatsappChatJobIdSegment(chat.id);

  return kind === 'CONTACTS'
    ? `whatsapp-history-contacts-${runId}-${chatSegment}-${attempt}`
    : `whatsapp-history-messages-${runId}-${chatSegment}-${payload.pageIndex}-${attempt}`;
};
