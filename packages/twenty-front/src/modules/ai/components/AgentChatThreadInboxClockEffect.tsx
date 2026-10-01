import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS } from '@/ai/constants/AgentChatThreadLastActivityFilterDays';
import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// setTimeout fires immediately past this delay
const MAX_TIMEOUT_DELAY_MS = 2 ** 31 - 1;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

// Snoozed threads come back, and threads age out of the last activity
// filter, when their time passes, which no event announces
export const AgentChatThreadInboxClockEffect = () => {
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const [agentChatThreadInboxNow, setAgentChatThreadInboxNow] = useAtomState(
    agentChatThreadInboxNowState,
  );
  const agentChatThreads = useAtomStateValue(agentChatThreadsSelector);
  const agentChatThreadLastActivityFilter = useAtomStateValue(
    agentChatThreadLastActivityFilterState,
  );

  useEffect(() => {
    const lastActivityFilterDays =
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS[
        agentChatThreadLastActivityFilter
      ];
    const snoozeEndMs = Object.values(agentChatThreadParticipants).map(
      ({ snoozedUntil }) =>
        isDefined(snoozedUntil) ? new Date(snoozedUntil).getTime() : Infinity,
    );
    const lastActivityCutoffMs = isDefined(lastActivityFilterDays)
      ? agentChatThreads.map(
          (thread) =>
            new Date(getAgentChatThreadLastActivityAt(thread)).getTime() +
            lastActivityFilterDays * MILLISECONDS_PER_DAY,
        )
      : [];
    const nextWakeUpMs = Math.min(
      ...[...snoozeEndMs, ...lastActivityCutoffMs].filter(
        (wakeUpMs) => wakeUpMs > agentChatThreadInboxNow,
      ),
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
    agentChatThreadLastActivityFilter,
    agentChatThreadParticipants,
    agentChatThreads,
    setAgentChatThreadInboxNow,
  ]);

  return null;
};
