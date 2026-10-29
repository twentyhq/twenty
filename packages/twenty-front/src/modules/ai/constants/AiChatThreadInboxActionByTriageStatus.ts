import { type AiChatThreadTriageStatus } from '@/ai/types/AiChatThreadTriageStatus';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const AI_CHAT_THREAD_INBOX_ACTION_BY_TRIAGE_STATUS: Record<
  AiChatThreadTriageStatus,
  AgentChatInboxAction
> = {
  open: AgentChatInboxAction.MOVE_TO_INBOX,
  snoozed: AgentChatInboxAction.SNOOZE,
  done: AgentChatInboxAction.ARCHIVE,
};
