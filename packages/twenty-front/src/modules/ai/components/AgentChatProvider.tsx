import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';
import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Suspense } from 'react';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

const createLoadingChat = () =>
  new Chat<UIMessageWithMetadata>({
    transport: new DefaultChatTransport({
      api: `${REST_API_BASE_URL}/agent-chat/stream`,
      headers: () => ({}),
    }),
    messages: [],
    id: 'loading',
  });

const AgentChatProviderContent = ({
  agentId,
  children,
}: {
  agentId: string;
  children: React.ReactNode;
}) => {
  const { uiMessages, isLoading } = useAgentChatData(agentId);
  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);

  const chatConfig = isLoading
    ? createLoadingChat()
    : new Chat<UIMessageWithMetadata>({
        transport: new DefaultChatTransport({
          api: `${REST_API_BASE_URL}/agent-chat/stream`,
          headers: () => ({
            Authorization: `Bearer ${getTokenPair()?.accessOrWorkspaceAgnosticToken.token}`,
          }),
        }),
        messages: uiMessages,
        id: `${currentAIChatThread}-${uiMessages.length}`,
      });

  return (
    <AgentChatContext.Provider
      value={{ chat: chatConfig, isLoadingData: isLoading }}
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
      <AgentChatContext.Provider
        value={{
          chat: createLoadingChat(),
          isLoadingData: false,
        }}
      >
        {children}
      </AgentChatContext.Provider>
    );
  }

  return (
    <Suspense
      fallback={
        <AgentChatContext.Provider
          value={{
            chat: createLoadingChat(),
            isLoadingData: true,
          }}
        >
          {children}
        </AgentChatContext.Provider>
      }
    >
      <AgentChatProviderContent agentId={agentId}>
        {children}
      </AgentChatProviderContent>
    </Suspense>
  );
};
