import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';

type AgentChatSessionProviderProps = {
  agentId: string;
  uiMessages: UIMessageWithMetadata[];
  isLoading: boolean;
  children: React.ReactNode;
};

export const AgentChatSessionProvider = ({
  agentId,
  uiMessages,
  isLoading,
  children,
}: AgentChatSessionProviderProps) => {
  const chatState = useAgentChat(agentId, uiMessages);

  const combinedIsLoading = chatState.isLoading || isLoading;

  return (
    <AgentChatContext.Provider
      value={{
        ...chatState,
        isLoading: combinedIsLoading,
      }}
    >
      {children}
    </AgentChatContext.Provider>
  );
};
