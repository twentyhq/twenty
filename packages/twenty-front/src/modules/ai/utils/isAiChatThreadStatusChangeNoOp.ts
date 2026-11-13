import { type InboxThreadTriageStatus } from '@/inbox/types/InboxThreadTriageStatus';

export const isAiChatThreadStatusChangeNoOp = ({
  currentStatus,
  nextStatus,
}: {
  currentStatus: InboxThreadTriageStatus | undefined;
  nextStatus: InboxThreadTriageStatus;
}) => nextStatus === currentStatus && nextStatus !== 'snoozed';
