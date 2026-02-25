import { AgentChatMessagesEffect } from '@/ai/components/AgentChatMessagesEffect';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const AgentChatDataLoading = () => {
  const { uiMessages, isLoading } = useAgentChatData();
  const chatState = useAgentChat(uiMessages);

  const combinedIsLoading = chatState.isLoading || isLoading;

  const setAgentChatDataLoading = useSetAtomState(agentChatIsLoadingState);
  const setAgentChatMessages = useSetAtomComponentState(
    agentChatMessagesComponentState,
  );
  const setAgentChatError = useSetAtomState(agentChatErrorState);

  useEffect(() => {
    setAgentChatDataLoading(combinedIsLoading);
  }, [combinedIsLoading, setAgentChatDataLoading]);

  useEffect(() => {
    setAgentChatMessages(chatState.messages);
  }, [chatState.messages, setAgentChatMessages]);

  useEffect(() => {
    setAgentChatError(chatState.error);
  }, [chatState.error, setAgentChatError]);

  return <AgentChatMessagesEffect messages={chatState.messages} />;
};
