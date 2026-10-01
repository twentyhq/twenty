import {
  getAgentChatThreadInboxScope,
  isAgentChatThreadUnread,
} from 'twenty-shared/utils';
import { type AgentChatThreadInboxScope } from 'twenty-shared/types';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadKeptUnreadIdState } from '@/ai/states/agentChatThreadKeptUnreadIdState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { buildAgentChatThreadInboxState } from '@/ai/utils/buildAgentChatThreadInboxState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

type AgentChatThreadInboxStatus = {
  scope: AgentChatThreadInboxScope;
  isUnread: boolean;
};

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
        const inboxState = buildAgentChatThreadInboxState(
          { lastActivityAt: storedThread?.lastActivityAt ?? lastActivityAt },
          get(agentChatThreadParticipantsState)[threadId],
        );
        const isViewed =
          get(agentChatViewedThreadIdState) === threadId &&
          get(agentChatThreadKeptUnreadIdState) !== threadId;

        return {
          scope: getAgentChatThreadInboxScope(
            inboxState,
            new Date(get(agentChatThreadInboxNowState)),
          ),
          // Without its participant rows every thread would read as unread.
          // The thread on screen is being read, so it never shows as unread
          // while its read mark is on its way
          isUnread:
            get(hasLoadedAgentChatThreadParticipantsState) &&
            !isViewed &&
            isAgentChatThreadUnread(inboxState),
        };
      },
  });
