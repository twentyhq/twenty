import { createContext, useContext } from 'react';

export type AgentChatContextValue = {
  ensureThreadForDraft: (() => void) | undefined;
  threadsLoading: boolean;
  messagesLoading: boolean;
  skipMessagesSkeleton: boolean;
};

export const AgentChatContext = createContext<AgentChatContextValue>({
  ensureThreadForDraft: undefined,
  threadsLoading: false,
  messagesLoading: false,
  skipMessagesSkeleton: false,
});

export const useAgentChatContext = () => useContext(AgentChatContext);
