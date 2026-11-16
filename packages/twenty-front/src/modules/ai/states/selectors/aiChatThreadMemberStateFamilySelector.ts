import { isDefined } from 'twenty-shared/utils';
import {
  type AgentChatThreadInboxStatus,
  getAgentChatThreadInboxStatus,
} from 'twenty-shared/ai';

import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { aiChatThreadVisitState } from '@/ai/states/aiChatThreadVisitState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const aiChatThreadMemberStateFamilySelector = createAtomFamilySelector<
  AgentChatThreadInboxStatus,
  string
>({
  key: 'aiChatThreadMemberStateFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const participants = get(aiChatThreadParticipantsState);
      const visit = get(aiChatThreadVisitState);
      const thread = get(aiChatThreadRecordFamilySelector, threadId);
      const currentWorkspaceMemberId = get(currentWorkspaceMemberState)?.id;
      const status = getAgentChatThreadInboxStatus({
        lastActivityAt: thread?.lastActivityAt,
        participant: participants?.[threadId],
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
