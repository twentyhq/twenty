import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatHasBeenOpenedEffect = () => {
  const setAgentChatUISessionStartTime = useSetAtomState(
    agentChatUISessionStartTimeState,
  );

  useEffect(() => {
    setAgentChatUISessionStartTime(
      (agentChatUISessionStartTime) =>
        agentChatUISessionStartTime ?? Temporal.Now.instant(),
    );
  }, [setAgentChatUISessionStartTime]);

  return null;
};
