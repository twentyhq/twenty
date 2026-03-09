import { AgentChatDataEffect } from '@/ai/components/AgentChatDataEffect';
import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { Suspense } from 'react';

export const AgentChatProviderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { ensureThreadForDraft, threadsLoading, messagesLoading } =
    useAgentChatData();

  const contextValue = {
    ensureThreadForDraft,
    threadsLoading,
    messagesLoading,
  };

  return (
    <Suspense fallback={null}>
      <AgentChatContext.Provider value={contextValue}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agentChatComponentInstance' }}
        >
          <AgentChatDataEffect />
          {children}
        </AgentChatComponentInstanceContext.Provider>
      </AgentChatContext.Provider>
    </Suspense>
  );
};
