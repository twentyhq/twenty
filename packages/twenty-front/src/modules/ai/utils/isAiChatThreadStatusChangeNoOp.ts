import { type InboxThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';

export const isInboxThreadStatusChangeNoOp = ({
  currentStatus,
  nextStatus,
}: {
  currentStatus: InboxThreadTriageStatus | undefined;
  nextStatus: InboxThreadTriageStatus;
}) => nextStatus === currentStatus && nextStatus !== 'snoozed';
