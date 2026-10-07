import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadInboxStatus } from '@/ai/types/AgentChatThreadInboxStatus';
import { getAgentChatThreadInboxStatus } from '@/ai/utils/getAgentChatThreadInboxStatus';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const agentChatThreadInboxStatusFamilySelector =
  createAtomFamilySelector<AgentChatThreadInboxStatus, string>({
    key: 'agentChatThreadInboxStatusFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        const participants = get(agentChatThreadParticipantsState);
        const visit = get(agentChatThreadVisitState);
        const thread = get(agentChatThreadRecordFamilySelector, threadId);
        const currentWorkspaceMemberId = get(currentWorkspaceMemberState)?.id;
        const status = getAgentChatThreadInboxStatus({
          lastActivityAt: thread?.lastActivityAt,
          participant: participants?.[threadId],
          isInChannel: isDefined(thread?.channelId),
        });

        // Before the rows load every thread would read as unread. The thread
        // on screen is being read, so it never shows as unread while its read
        // mark is on its way
        const isOnScreen = visit?.threadId === threadId && !visit.isKeptUnread;

        return {
          ...status,
          isUnread: isDefined(participants) && !isOnScreen && status.isUnread,
          isAssignedToMe:
            isDefined(currentWorkspaceMemberId) &&
            thread?.assigneeId === currentWorkspaceMemberId,
          isChannelCopy: false,
        };
      },
    areEqual: isDeeplyEqual,
  });
