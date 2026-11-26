import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type AiChatThreadsAssigneeSummary = {
  sharedAssigneeId: string | null;
  hasAssignee: boolean;
};

export const aiChatThreadsAssigneeSummaryFamilySelector =
  createAtomFamilySelector<
    AiChatThreadsAssigneeSummary,
    { threadIds: string[] }
  >({
    key: 'aiChatThreadsAssigneeSummaryFamilySelector',
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
