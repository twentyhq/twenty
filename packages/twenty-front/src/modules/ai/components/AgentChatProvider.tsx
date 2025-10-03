import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Suspense } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

const AgentChatProviderContent = ({
  agentId,
  children,
}: {
  agentId: string;
  children: React.ReactNode;
}) => {
  const { uiMessages, isLoading } = useAgentChatData(agentId);
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

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const agentId = currentWorkspace?.defaultAgent?.id;
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  if (!isAiEnabled || !agentId) {
    return (
      <AgentChatContext.Provider value={null}>
        {children}
      </AgentChatContext.Provider>
    );
  }

  return (
    <Suspense fallback={null}>
      <AgentChatProviderContent agentId={agentId}>
        {children}
      </AgentChatProviderContent>
    </Suspense>
  );
};
