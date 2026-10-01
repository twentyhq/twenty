import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadUnreadSince = {
  threadId: string;
  visitId: string;
  isUnread: boolean;
  lastReadAt: string | null;
};

// Taken once per visit of a thread, before it is marked read, so the unread
// line stays where the member left off while they read
export const agentChatThreadUnreadSinceState =
  createAtomState<AgentChatThreadUnreadSince | null>({
    key: 'ai/agentChatThreadUnreadSinceState',
    defaultValue: null,
  });
