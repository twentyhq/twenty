import { isDefined } from 'twenty-shared/utils';

import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type InboxThreadsSharedAssignee = {
  // Set only when every chat has the same assignee
  sharedAssigneeId: string | null;
  hasAssignee: boolean;
};

export const inboxThreadsSharedAssigneeIdFamilySelector =
  createAtomFamilySelector<InboxThreadsSharedAssignee, { threadIds: string[] }>(
    {
      key: 'inboxThreadsSharedAssigneeIdFamilySelector',
      get:
        ({ threadIds }) =>
        ({ get }) => {
          const assigneeIds = threadIds.map(
            (threadId) =>
              get(inboxThreadRecordFamilySelector, threadId)?.assigneeId ??
              null,
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
    },
  );
