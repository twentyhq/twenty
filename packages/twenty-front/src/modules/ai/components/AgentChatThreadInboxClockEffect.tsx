import { useEffect } from 'react';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const AGENT_CHAT_THREAD_INBOX_CLOCK_INTERVAL_MS = 60 * 1000;

// Snoozed threads come back when their time passes, which no event announces
export const AgentChatThreadInboxClockEffect = () => {
  const setAgentChatThreadInboxNow = useSetAtomState(
    agentChatThreadInboxNowState,
  );

  useEffect(() => {
    setAgentChatThreadInboxNow(Date.now());

    const intervalId = window.setInterval(
      () => setAgentChatThreadInboxNow(Date.now()),
      AGENT_CHAT_THREAD_INBOX_CLOCK_INTERVAL_MS,
    );

    return () => window.clearInterval(intervalId);
  }, [setAgentChatThreadInboxNow]);

  return null;
};
