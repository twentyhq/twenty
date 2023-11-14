import { DateTime } from 'luxon';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { turnFilterIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFilterIntoWhereClause';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { parseDate } from '~/utils/date-utils';

export const useCurrentUserTaskCount = () => {
  const [currentUser] = useRecoilState(currentUserState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { data } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { equals: null },
        ...(currentUser
          ? turnFilterIntoWhereClause({
              fieldMetadataId: 'assigneeId',
              value: currentUser.id,
              operand: ViewFilterOperand.Is,
              displayValue:
                currentWorkspaceMember?.firstName +
                ' ' +
                currentWorkspaceMember?.lastName,
              displayAvatarUrl: currentWorkspaceMember?.avatarUrl ?? undefined,
              definition: {
                type: 'ENTITY',
              },
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
};
