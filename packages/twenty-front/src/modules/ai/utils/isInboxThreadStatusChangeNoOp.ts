import { type InboxThreadTriageStatus } from '@/ai/types/InboxThreadTriageStatus';

export const isInboxThreadStatusChangeNoOp = ({
  currentStatus,
  nextStatus,
}: {
  currentStatus: InboxThreadTriageStatus | undefined;
  nextStatus: InboxThreadTriageStatus;
}) => nextStatus === currentStatus && nextStatus !== 'snoozed';
