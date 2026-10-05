import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatThreadVisit = {
  threadId: string;
  // Where the member left off when the thread opened, taken before it is
  // marked read, so the unread line stays put while they read
  isUnread: boolean;
  lastReadAt: string | null;
  // Marked unread while on screen, so the open view does not read it again
  isKeptUnread: boolean;
};

// The thread on screen in a visible tab
export const agentChatThreadVisitState =
  createAtomState<AgentChatThreadVisit | null>({
    key: 'ai/agentChatThreadVisitState',
    defaultValue: null,
  });
