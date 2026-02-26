import { AgentChatMessagesEffect } from '@/ai/components/AgentChatMessagesEffect';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { agentChatErrorState } from '@/ai/states/agentChatErrorState';
import { agentChatIsLoadingState } from '@/ai/states/agentChatIsLoadingState';
import { agentChatMessagesComponentState } from '@/ai/states/agentChatMessagesComponentState';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

export const AgentChatDataLoading = () => {
  const { uiMessages, isLoading } = useAgentChatData();
  const chatState = useAgentChat(uiMessages);

  const combinedIsLoading = chatState.isLoading || isLoading;

  const setAgentChatDataLoading = useSetAtomState(agentChatIsLoadingState);
  const setAgentChatMessages = useSetAtomComponentState(
    agentChatMessagesComponentState,
  );
  const setAgentChatError = useSetAtomState(agentChatErrorState);

  const [agentChatUISessionStartTime, setAgentChatUISessionStartTime] =
    useAtomState(agentChatUISessionStartTimeState);

  useEffect(() => {
    setAgentChatDataLoading(combinedIsLoading);
  }, [combinedIsLoading, setAgentChatDataLoading]);

  useEffect(() => {
    setAgentChatMessages(chatState.messages);
  }, [chatState.messages, setAgentChatMessages]);

  useEffect(() => {
    setAgentChatError(chatState.error);
  }, [chatState.error, setAgentChatError]);

  useEffect(() => {
    if (agentChatUISessionStartTime === null) {
      setAgentChatUISessionStartTime(Temporal.Now.instant());
    }
  }, [agentChatUISessionStartTime, setAgentChatUISessionStartTime]);

  return (
    <AgentChatMessagesEffect incrementalStreamMessages={chatState.messages} />
  );
};
