import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type AiChatThreadsSharedAssignee = {
  // Set only when every chat has the same assignee
  sharedAssigneeId: string | null;
  hasAssignee: boolean;
};

export const aiChatThreadsSharedAssigneeIdFamilySelector =
  createAtomFamilySelector<
    AiChatThreadsSharedAssignee,
    { threadIds: string[] }
  >({
    key: 'aiChatThreadsSharedAssigneeIdFamilySelector',
    get:
      ({ threadIds }) =>
      ({ get }) => {
        const assigneeIds = threadIds.map(
          (threadId) =>
            get(aiChatThreadRecordFamilySelector, threadId)?.assigneeId ?? null,
        );
        const [firstAssigneeId] = assigneeIds;

        return {
          sharedAssigneeId: assigneeIds.every(
            (assigneeId) => assigneeId === firstAssigneeId,
          )
            ? (firstAssigneeId ?? null)
            : null,
          hasAssignee: assigneeIds.some(isDefined),
        };
      },
    areEqual: isDeeplyEqual,
  });
