import { DateTime } from 'luxon';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { turnFilterIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFilterIntoWhereClause';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { SortOrder } from '~/generated/graphql';
import { ActivityType } from '~/generated-metadata/graphql';
import { parseDate } from '~/utils/date-utils';

export const useCurrentUserTaskCount = () => {
  const [currentUser] = useRecoilState(currentUserState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objects } = useFindManyObjectRecords({
    objectNamePlural: 'activitiesV2',
    filter: {
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
    orderBy: [
      {
        createdAt: SortOrder.Desc,
      },
    ],
  });

  const currentUserDueTaskCount = objects.filter((task) => {
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
