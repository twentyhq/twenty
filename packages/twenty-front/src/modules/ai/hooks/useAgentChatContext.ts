import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useContext } from 'react';

export const useAgentChatContext = () => {
  const context = useContext(AgentChatContext);

  if (!context) {
    throw new Error(
      'useAgentChatContext must be used within AgentChatProvider',
    );
  }

  return context;
};
