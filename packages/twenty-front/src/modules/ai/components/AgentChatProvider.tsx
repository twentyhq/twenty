import { AgentChatMessagesEffect } from '@/ai/components/AgentChatMessagesEffect';
import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Suspense } from 'react';
import { FeatureFlagKey } from '~/generated/graphql';

const AgentChatProviderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { uiMessages, isLoading } = useAgentChatData();
  const chatState = useAgentChat(uiMessages);
  const combinedIsLoading = chatState.isLoading || isLoading;

  return (
    <AgentChatContext.Provider
      value={{
        ...chatState,
        isLoading: combinedIsLoading,
      }}
    >
      <AgentChatMessagesEffect messages={chatState.messages} />
      {children}
    </AgentChatContext.Provider>
  );
};

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  if (!isAiEnabled) {
    return (
      <AgentChatContext.Provider value={null}>
        {children}
      </AgentChatContext.Provider>
    );
  }

  return (
    <Suspense fallback={null}>
      <AgentChatProviderContent>{children}</AgentChatProviderContent>
    </Suspense>
  );
};
