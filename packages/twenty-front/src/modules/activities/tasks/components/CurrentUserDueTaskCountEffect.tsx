import { useEffect } from 'react';
import { DateTime } from 'luxon';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserDueTaskCountState } from '@/activities/tasks/states/currentUserTaskCountState';
import { Activity } from '@/activities/types/Activity';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { parseDate } from '~/utils/date-utils';

export const CurrentUserDueTaskCountEffect = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [currentUserDueTaskCount, setCurrentUserDueTaskCount] = useRecoilState(
    currentUserDueTaskCountState,
  );

  const { records: tasks } = useFindManyRecords<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
    depth: 0,
    filter: {
      type: { eq: 'Task' },
      completedAt: { is: 'NULL' },
      assigneeId: { eq: currentWorkspaceMember?.id },
    },
  });

  const computedCurrentUserDueTaskCount = tasks.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = DateTime.now().endOf('day').toJSDate();
    return dueDate <= today;
  }).length;

  useEffect(() => {
    if (currentUserDueTaskCount !== computedCurrentUserDueTaskCount) {
      setCurrentUserDueTaskCount(computedCurrentUserDueTaskCount);
    }
  }, [
    computedCurrentUserDueTaskCount,
    currentUserDueTaskCount,
    setCurrentUserDueTaskCount,
  ]);

  return <></>;
};
