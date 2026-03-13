import { useInitialAgentChatThreadQuery } from '@/ai/hooks/useInitialAgentChatThreadQuery';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

export const AgentChatThreadInitializationEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const { threadsLoading } =
    useInitialAgentChatThreadQuery(currentAIChatThread);

  const setAgentChatThreadsLoading = useSetAtomState(
    agentChatThreadsLoadingState,
  );

  useEffect(() => {
    setAgentChatThreadsLoading(threadsLoading);
  }, [threadsLoading, setAgentChatThreadsLoading]);

  return null;
};
