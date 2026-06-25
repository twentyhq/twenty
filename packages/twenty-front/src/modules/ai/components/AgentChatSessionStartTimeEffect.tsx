import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

export const AgentChatSessionStartTimeEffect = () => {
  const [agentChatUISessionStartTime, setAgentChatUISessionStartTime] =
    useAtomState(agentChatUISessionStartTimeState);

  useEffect(() => {
    if (agentChatUISessionStartTime === null) {
      setAgentChatUISessionStartTime(Temporal.Now.instant());
    }
  }, [agentChatUISessionStartTime, setAgentChatUISessionStartTime]);

  return null;
};
