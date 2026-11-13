import { type InboxThreadTriageStatus } from '@/inbox/types/InboxThreadTriageStatus';
import { AgentChatInboxAction } from '~/generated-metadata/graphql';

export const INBOX_THREAD_STATUS_ACTION_BY_TRIAGE_STATUS: Record<
  InboxThreadTriageStatus,
  AgentChatInboxAction
> = {
  open: AgentChatInboxAction.MOVE_TO_INBOX,
  snoozed: AgentChatInboxAction.SNOOZE,
  done: AgentChatInboxAction.ARCHIVE,
};
