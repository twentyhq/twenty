import { createContext, useContext } from 'react';

export type AgentChatContextValue = {
  ensureThreadForDraft: (() => void) | undefined;
  threadsLoading: boolean;
  messagesLoading: boolean;
};

export const AgentChatContext = createContext<AgentChatContextValue>({
  ensureThreadForDraft: undefined,
  threadsLoading: false,
  messagesLoading: false,
});

export const useAgentChatContext = () => useContext(AgentChatContext);
