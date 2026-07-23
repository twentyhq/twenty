import { useEffect } from 'react';

import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatHasBeenOpenedEffect = () => {
  const setHasAgentChatBeenOpened = useSetAtomState(
    hasAgentChatBeenOpenedState,
  );

  useEffect(() => {
    setHasAgentChatBeenOpened(true);
  }, [setHasAgentChatBeenOpened]);

  return null;
};
