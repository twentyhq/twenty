import { type AgentChatThreadInboxScope } from '@/ai/types/AgentChatThreadInboxScope';

export type AgentChatThreadInboxStatus = {
  scope: AgentChatThreadInboxScope;
  isUnread: boolean;
  snoozedUntil: string | null;
  doneAt: string | null;
  snoozeEndedAt: string | null;
};
