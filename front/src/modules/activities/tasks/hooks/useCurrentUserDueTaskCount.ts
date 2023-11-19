import { DateTime } from 'luxon';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { parseDate } from '~/utils/date-utils';

export const useCurrentUserTaskCount = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { objects } = useFindManyObjectRecords({
    objectNamePlural: 'activities',
    filter: {
      type: { eq: 'Task' },
      completedAt: { eq: null },
      assigneeId: { eq: currentWorkspaceMember?.id },
    },
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
