import { type InboxThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';

export const isAiChatThreadStatusChangeNoOp = ({
  currentStatus,
  nextStatus,
}: {
  currentStatus: InboxThreadTriageStatus | undefined;
  nextStatus: InboxThreadTriageStatus;
}) => nextStatus === currentStatus && nextStatus !== 'snoozed';
