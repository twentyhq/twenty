import {
  getAgentChatThreadInboxScope,
  isAgentChatThreadUnread,
  isDefined,
} from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS } from '@/ai/constants/AgentChatThreadLastActivityFilterDays';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { buildAgentChatThreadInboxState } from '@/ai/utils/buildAgentChatThreadInboxState';
import { getAgentChatThreadLastActivityAt } from '@/ai/utils/getAgentChatThreadLastActivityAt';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const agentChatVisibleThreadsSelector = createAtomSelector<
  AgentChatThreadRecord[]
>({
  key: 'agentChatVisibleThreadsSelector',
  get: ({ get }) => {
    const allThreads = get(agentChatThreadsSelector);
    const filterStatus = get(agentChatThreadFilterStatusState);
    const lastActivityFilter = get(agentChatThreadLastActivityFilterState);
    const participants = get(agentChatThreadParticipantsState);
    const hasLoadedParticipants = get(
      hasLoadedAgentChatThreadParticipantsState,
    );
    const now = get(agentChatThreadInboxNowState);
    const lastActivityDays =
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER_DAYS[lastActivityFilter];

    const cutoffMs =
      lastActivityDays !== null
        ? now - lastActivityDays * MILLISECONDS_PER_DAY
        : null;

    return allThreads.filter((thread) => {
      const inboxState = buildAgentChatThreadInboxState(
        thread,
        participants[thread.id],
      );
      const inboxScope = getAgentChatThreadInboxScope(
        inboxState,
        new Date(now),
      );

      switch (filterStatus) {
        case AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE:
          if (isDefined(thread.deletedAt) || inboxScope !== 'INBOX') {
            return false;
          }
          break;
        case AGENT_CHAT_THREAD_FILTER_STATUS.UNREAD:
          if (
            isDefined(thread.deletedAt) ||
            inboxScope !== 'INBOX' ||
            !hasLoadedParticipants ||
            !isAgentChatThreadUnread(inboxState)
          ) {
            return false;
          }
          break;
        case AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED:
          if (isDefined(thread.deletedAt) || inboxScope !== 'SNOOZED') {
            return false;
          }
          break;
        case AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED:
          if (isDefined(thread.deletedAt) || inboxScope !== 'ARCHIVED') {
            return false;
          }
          break;
        case AGENT_CHAT_THREAD_FILTER_STATUS.DELETED:
          if (!isDefined(thread.deletedAt)) {
            return false;
          }
          break;
        case AGENT_CHAT_THREAD_FILTER_STATUS.ALL:
          break;
      }

      if (cutoffMs !== null) {
        const lastActivityMs = new Date(
          getAgentChatThreadLastActivityAt(thread),
        ).getTime();
        if (lastActivityMs < cutoffMs) {
          return false;
        }
      }

      return true;
    });
  },
});
