import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useContext } from 'react';

export const useAgentChatContextOrThrow = () => {
  const context = useContext(AgentChatContext);

  if (!context) {
    throw new Error(
      'AgentChatContext not found. Please wrap your component tree with <AgentChatContextProvider> before using useAgentChatContextOrThrow().',
    );
  }

  return context;
};
