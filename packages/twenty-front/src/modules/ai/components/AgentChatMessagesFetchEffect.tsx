import { useAgentChatMessagesQuery } from '@/ai/hooks/useAgentChatMessagesQuery';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatUiMessagesState } from '@/ai/states/agentChatUiMessagesState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const AgentChatMessagesFetchEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const { messagesLoading, uiMessages } =
    useAgentChatMessagesQuery(currentAIChatThread);

  const setAgentChatMessagesLoading = useSetAtomState(
    agentChatMessagesLoadingState,
  );

  useEffect(() => {
    setAgentChatMessagesLoading(messagesLoading);
  }, [messagesLoading, setAgentChatMessagesLoading]);

  const setAgentChatUiMessages = useSetAtomState(agentChatUiMessagesState);

  useEffect(() => {
    setAgentChatUiMessages(uiMessages);
  }, [uiMessages, setAgentChatUiMessages]);

  return null;
};
