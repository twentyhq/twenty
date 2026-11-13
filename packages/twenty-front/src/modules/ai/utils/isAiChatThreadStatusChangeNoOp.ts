import { type InboxThreadTriageStatus } from '@/ai/types/InboxThreadTriageStatus';

export const isAiChatThreadStatusChangeNoOp = ({
  currentStatus,
  nextStatus,
}: {
  currentStatus: InboxThreadTriageStatus | undefined;
  nextStatus: InboxThreadTriageStatus;
}) => nextStatus === currentStatus && nextStatus !== 'snoozed';
