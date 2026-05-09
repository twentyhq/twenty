import { agentChatIsInitialScrollPendingOnThreadChangeState } from '@/ai/states/agentChatIsInitialScrollPendingOnThreadChangeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLayoutEffect } from 'react';

export const AgentChatScrollToBottomOnMountLayoutEffect = () => {
  const setAgentChatIsInitialScrollPendingOnThreadChange = useSetAtomState(
    agentChatIsInitialScrollPendingOnThreadChangeState,
  );

  useLayoutEffect(() => {
    setAgentChatIsInitialScrollPendingOnThreadChange(true);
  }, [setAgentChatIsInitialScrollPendingOnThreadChange]);

  return null;
};
