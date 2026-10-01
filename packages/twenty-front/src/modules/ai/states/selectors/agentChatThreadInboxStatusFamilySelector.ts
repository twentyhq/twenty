import { isDefined } from 'twenty-shared/utils';

import { getAgentChatThreadInboxScope } from '@/ai/utils/getAgentChatThreadInboxScope';
import { isAgentChatThreadUnread } from '@/ai/utils/isAgentChatThreadUnread';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadKeptUnreadIdState } from '@/ai/states/agentChatThreadKeptUnreadIdState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const isAfter = (date: string | null, reference: string) =>
  isDefined(date) && new Date(date).getTime() > new Date(reference).getTime();

type AgentChatThreadInboxStatusFamilyKey = {
  threadId: string;
  lastActivityAt: string | null;
};

// The key carries the activity time the caller fetched, for threads the chat
// list has not loaded into the record store, such as those on a record page
export const agentChatThreadInboxStatusFamilySelector =
  createAtomFamilySelector<
    AgentChatThreadInboxStatus,
    AgentChatThreadInboxStatusFamilyKey
  >({
    key: 'agentChatThreadInboxStatusFamilySelector',
    get:
      ({ threadId, lastActivityAt }) =>
      ({ get }) => {
        const storedThread = get(agentChatThreadRecordFamilySelector, threadId);
        const threadLastActivityAt =
          storedThread?.lastActivityAt ?? lastActivityAt;
        const participant = get(agentChatThreadParticipantsState)[threadId];
        const isViewed =
          get(agentChatViewedThreadIdState) === threadId &&
          get(agentChatThreadKeptUnreadIdState) !== threadId;

        const scope = getAgentChatThreadInboxScope({
          lastActivityAt: threadLastActivityAt,
          participant,
          now: new Date(get(agentChatThreadInboxNowState)),
        });

        return {
          scope,
          // Without its participant rows every thread would read as unread.
          // The thread on screen is being read, so it never shows as unread
          // while its read mark is on its way
          isUnread:
            get(hasLoadedAgentChatThreadParticipantsState) &&
            !isViewed &&
            isAgentChatThreadUnread({
              lastActivityAt: threadLastActivityAt,
              participant,
            }),
          snoozedUntil:
            scope === 'SNOOZED' ? (participant?.snoozedUntil ?? null) : null,
          doneAt:
            scope === 'ARCHIVED' ? (participant?.archivedAt ?? null) : null,
          // Still archived but back in the inbox without newer activity: the
          // snooze ran out
          snoozeEndedAt:
            scope === 'INBOX' &&
            isDefined(participant?.archivedAt) &&
            !isAfter(threadLastActivityAt, participant.archivedAt)
              ? (participant.snoozedUntil ?? null)
              : null,
        };
      },
    areEqual: isDeeplyEqual,
  });
