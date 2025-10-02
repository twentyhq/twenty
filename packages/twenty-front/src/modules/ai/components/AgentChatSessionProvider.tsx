import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';

export const AgentChatSessionProvider = ({
  agentId,
  uiMessages,
  isLoading,
  children,
}: {
  agentId: string;
  uiMessages: UIMessageWithMetadata[];
  isLoading: boolean;
  children: React.ReactNode;
}) => {
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
