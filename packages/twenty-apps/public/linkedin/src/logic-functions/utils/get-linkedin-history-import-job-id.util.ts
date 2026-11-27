import { createHash } from 'node:crypto';

import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';

const LINKEDIN_CHAT_ID_HASH_LENGTH = 32;

export const getLinkedinPlanHistoryImportJobId = ({
  runId,
  continuationIndex = 0,
}: {
  runId: string;
  continuationIndex?: number;
}): string => `linkedin-history-plan-${runId}-${continuationIndex}`;

// Job ids only accept [\w.-] up to 128 characters, which Unipile chat ids do not respect
export const getLinkedinChatJobIdSegment = (chatId: string): string =>
  createHash('sha256')
    .update(chatId)
    .digest('hex')
    .slice(0, LINKEDIN_CHAT_ID_HASH_LENGTH);

export const getLinkedinHistoryImportChatJobId = ({
  kind,
  payload,
}: LinkedinHistoryImportChatJob): string => {
  const { runId, chat, attempt = 0 } = payload;
  const chatSegment = getLinkedinChatJobIdSegment(chat.id);

  return kind === 'CONTACTS'
    ? `linkedin-history-contacts-${runId}-${chatSegment}-${attempt}`
    : `linkedin-history-messages-${runId}-${chatSegment}-${payload.pageIndex}-${attempt}`;
};
