import { type AiChatThreadTriageStatus } from '@/ai-chat/threads/types/AiChatThreadTriageStatus';

export const isAiChatThreadStatusChangeNoOp = ({
  currentStatus,
  nextStatus,
}: {
  currentStatus: AiChatThreadTriageStatus | undefined;
  nextStatus: AiChatThreadTriageStatus;
}) => nextStatus === currentStatus && nextStatus !== 'snoozed';
