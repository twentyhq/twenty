import { isDefined } from 'twenty-shared/utils';

import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

// Empty until the member state loads, so inbox commands stay hidden rather
// than offering the wrong half of a pair
export const agentChatThreadInboxStatusesFamilySelector =
  createAtomFamilySelector<
    Record<string, AgentChatThreadInboxStatus>,
    string[]
  >({
    key: 'agentChatThreadInboxStatusesFamilySelector',
    get:
      (threadIds) =>
      ({ get }) => {
        if (!get(hasLoadedAgentChatThreadParticipantsState)) {
          return {};
        }

        return Object.fromEntries(
          threadIds.map((threadId) => [
            threadId,
            get(agentChatThreadInboxStatusFamilySelector, {
              threadId,
              lastActivityAt:
                get(agentChatThreadRecordFamilySelector, threadId)
                  ?.lastActivityAt ?? null,
            }),
          ]),
        );
      },
    areEqual: (previous, next) =>
      Object.keys(previous).length === Object.keys(next).length &&
      Object.entries(next).every(
        ([threadId, status]) =>
          isDefined(previous[threadId]) &&
          previous[threadId].scope === status.scope &&
          previous[threadId].isUnread === status.isUnread,
      ),
  });
