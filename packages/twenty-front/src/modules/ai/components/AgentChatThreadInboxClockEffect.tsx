import { millisecondsInMinute } from 'date-fns/constants';
import { useEffect } from 'react';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Snoozes end without any event announcing it
export const AgentChatThreadInboxClockEffect = () => {
  const setAgentChatThreadInboxNow = useSetAtomState(
    agentChatThreadInboxNowState,
  );

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setAgentChatThreadInboxNow(Date.now()),
      millisecondsInMinute,
    );

    return () => window.clearInterval(intervalId);
  }, [setAgentChatThreadInboxNow]);

  return null;
};
