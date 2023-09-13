import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { FilterOperand } from '@/ui/view-bar/types/FilterOperand';
import { turnFilterIntoWhereClause } from '@/ui/view-bar/utils/turnFilterIntoWhereClause';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { parseDate } from '~/utils/date-utils';

export function useCurrentUserTaskCount() {
  const [currentUser] = useRecoilState(currentUserState);

  const { data } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { equals: null },
        ...(currentUser
          ? turnFilterIntoWhereClause({
              key: 'assigneeId',
              type: 'entity',
              value: currentUser.id,
              operand: FilterOperand.Is,
              displayValue: currentUser.displayName,
              displayAvatarUrl: currentUser.avatarUrl ?? undefined,
            })
          : {}),
      },
    },
  });

  const currentUserDueTaskCount = data?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = DateTime.now().endOf('day').toJSDate();
    return dueDate <= today;
  }).length;

  return {
    currentUserDueTaskCount,
  };
}
