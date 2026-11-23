import { type AiChatThreadTriageStatus } from '@/inbox/types/AiChatThreadTriageStatus';

export const isAiChatThreadStatusChangeNoOp = ({
  currentStatus,
  nextStatus,
}: {
  currentStatus: AiChatThreadTriageStatus | undefined;
  nextStatus: AiChatThreadTriageStatus;
}) => nextStatus === currentStatus && nextStatus !== 'snoozed';
