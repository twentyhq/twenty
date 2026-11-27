import { isDefined } from 'twenty-shared/utils';
import {
  type AgentChatThreadInboxStatus,
  getAgentChatThreadInboxStatus,
} from 'twenty-shared/ai';

import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { aiChatThreadViewVisitFamilyState } from '@/ai-chat/states/view/aiChatThreadViewVisitFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const aiChatThreadInboxStatusFamilySelector = createAtomFamilySelector<
  AgentChatThreadInboxStatus,
  string
>({
  key: 'aiChatThreadInboxStatusFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const participants = get(aiChatThreadParticipantsState);
      const visit = get(aiChatThreadViewVisitFamilyState, { threadId });
      const thread = get(aiChatThreadRecordFamilySelector, threadId);
      const currentWorkspaceMemberId = get(currentWorkspaceMemberState)?.id;
      const status = getAgentChatThreadInboxStatus({
        lastActivityAt: thread?.lastActivityAt,
        participant: participants.rowsByThreadId[threadId],
      });

      const isOnScreen = isDefined(visit) && !visit.isKeptUnread;

      return {
        ...status,
        isUnread: participants.isLoaded && !isOnScreen && status.isUnread,
        isAssignedToMe:
          isDefined(currentWorkspaceMemberId) &&
          thread?.assigneeId === currentWorkspaceMemberId,
        isChannelCopy: false,
      };
    },
  areEqual: isDeeplyEqual,
});
