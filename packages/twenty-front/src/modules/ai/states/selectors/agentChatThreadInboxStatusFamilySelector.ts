import {
  getAgentChatThreadInboxScope,
  isAgentChatThreadUnread,
} from 'twenty-shared/utils';
import { type AgentChatThreadInboxScope } from 'twenty-shared/types';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatViewedThreadIdState } from '@/ai/states/agentChatViewedThreadIdState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { buildAgentChatThreadInboxState } from '@/ai/utils/buildAgentChatThreadInboxState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

type AgentChatThreadInboxStatus = {
  scope: AgentChatThreadInboxScope;
  isUnread: boolean;
};

export const agentChatThreadInboxStatusFamilySelector =
  createAtomFamilySelector<AgentChatThreadInboxStatus, string>({
    key: 'agentChatThreadInboxStatusFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        const inboxState = buildAgentChatThreadInboxState(
          get(recordStoreFamilyState, threadId) as AgentChatThreadRecord | null,
          get(agentChatThreadParticipantsState)[threadId],
        );

        return {
          scope: getAgentChatThreadInboxScope(
            inboxState,
            new Date(get(agentChatThreadInboxNowState)),
          ),
          // The thread on screen is being read, so it never shows as unread
          // while its read mark is on its way
          isUnread:
            get(agentChatViewedThreadIdState) !== threadId &&
            isAgentChatThreadUnread(inboxState),
        };
      },
  });
