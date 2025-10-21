import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Suspense } from 'react';
import { useRecoilValue } from 'recoil';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { FeatureFlagKey } from '~/generated/graphql';

const createLoadingChat = () =>
  new Chat<ExtendedUIMessage>({
    transport: new DefaultChatTransport({
      api: `${REST_API_BASE_URL}/agent-chat/stream`,
      headers: () => ({}),
    }),
    messages: [],
    id: 'loading',
  });

const AgentChatProviderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { uiMessages, isLoading } = useAgentChatData();
  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);

  const chatConfig = isLoading
    ? createLoadingChat()
    : new Chat<ExtendedUIMessage>({
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
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  if (!isAiEnabled) {
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
      <AgentChatProviderContent>{children}</AgentChatProviderContent>
    </Suspense>
  );
};
