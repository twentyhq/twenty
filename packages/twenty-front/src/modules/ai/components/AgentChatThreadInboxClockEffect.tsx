import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// setTimeout fires immediately past this delay
const MAX_TIMEOUT_DELAY_MS = 2 ** 31 - 1;

// Snoozed threads come back when their time passes, which no event announces
export const AgentChatThreadInboxClockEffect = () => {
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const [agentChatThreadInboxNow, setAgentChatThreadInboxNow] = useAtomState(
    agentChatThreadInboxNowState,
  );

  useEffect(() => {
    const nextWakeUpMs = Math.min(
      ...Object.values(agentChatThreadParticipants)
        .map(({ snoozedUntil }) =>
          isDefined(snoozedUntil) ? new Date(snoozedUntil).getTime() : Infinity,
        )
        .filter((wakeUpMs) => wakeUpMs > agentChatThreadInboxNow),
    );

    if (!Number.isFinite(nextWakeUpMs)) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => setAgentChatThreadInboxNow(Date.now()),
      Math.min(Math.max(nextWakeUpMs - Date.now(), 0), MAX_TIMEOUT_DELAY_MS),
    );

    return () => window.clearTimeout(timeoutId);
  }, [
    agentChatThreadInboxNow,
    agentChatThreadParticipants,
    setAgentChatThreadInboxNow,
  ]);

  return null;
};
