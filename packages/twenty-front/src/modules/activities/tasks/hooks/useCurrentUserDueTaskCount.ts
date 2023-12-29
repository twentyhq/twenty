import { DateTime } from 'luxon';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { parseDate } from '~/utils/date-utils';

export const useCurrentUserTaskCount = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: tasks } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Activity,
    filter: {
      type: { eq: 'Task' },
      completedAt: { is: 'NULL' },
      assigneeId: { eq: currentWorkspaceMember?.id },
    },
  });

  const currentUserDueTaskCount = tasks.filter((task) => {
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
