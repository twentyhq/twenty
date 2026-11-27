import { type LinkedinHistoryImportChatJob } from 'src/logic-functions/types/linkedin-history-import-chat-job.type';

export const getLinkedinPlanHistoryImportJobId = ({
  runId,
  continuationIndex = 0,
}: {
  runId: string;
  continuationIndex?: number;
}): string => `linkedin-history-plan-${runId}-${continuationIndex}`;

export const getLinkedinHistoryImportChatJobId = ({
  kind,
  payload,
}: LinkedinHistoryImportChatJob): string => {
  const { runId, chat, attempt = 0 } = payload;

  return kind === 'CONTACTS'
    ? `linkedin-history-contacts-${runId}-${chat.id}-${attempt}`
    : `linkedin-history-messages-${runId}-${chat.id}-${payload.pageIndex}-${attempt}`;
};
