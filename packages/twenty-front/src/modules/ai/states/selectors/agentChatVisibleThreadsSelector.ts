import { millisecondsInDay } from 'date-fns/constants';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadInboxScope } from '@/ai/types/AgentChatThreadInboxScope';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS } from '@/ai/constants/AgentChatThreadLastActivityFilterDays';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

const INBOX_SCOPE_BY_FILTER_STATUS: Partial<
  Record<AgentChatThreadFilterStatus, AgentChatThreadInboxScope>
> = {
  [AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE]: 'INBOX',
  [AGENT_CHAT_THREAD_FILTER_STATUS.UNREAD]: 'INBOX',
  [AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED]: 'SNOOZED',
  [AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED]: 'ARCHIVED',
};

export const agentChatVisibleThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatVisibleThreadsSelector',
  get: ({ get }) => {
    const filterStatus = get(agentChatThreadFilterStatusState);
    const lastActivityDays =
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS[
        get(agentChatThreadLastActivityFilterState)
      ];
    const cutoffMs = isDefined(lastActivityDays)
      ? get(agentChatThreadInboxNowState) - lastActivityDays * millisecondsInDay
      : null;
    const requiredScope = INBOX_SCOPE_BY_FILTER_STATUS[filterStatus];

    const isInFilterStatus = (thread: AgentChatThreadRecord) => {
      if (filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ALL) {
        return true;
      }

      if (filterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.DELETED) {
        return isDefined(thread.deletedAt);
      }

      if (isDefined(thread.deletedAt)) {
        return false;
      }

      const { scope, isUnread } = get(
        agentChatThreadInboxStatusFamilySelector,
        { threadId: thread.id, lastActivityAt: thread.lastActivityAt ?? null },
      );

      return (
        scope === requiredScope &&
        (filterStatus !== AGENT_CHAT_THREAD_FILTER_STATUS.UNREAD || isUnread)
      );
    };

    return get(agentChatThreadsSelector).filter(
      (thread) =>
        isInFilterStatus(thread) &&
        (!isDefined(cutoffMs) ||
          new Date(getAgentChatThreadLastActivityAt(thread)).getTime() >=
            cutoffMs),
    );
  },
});
