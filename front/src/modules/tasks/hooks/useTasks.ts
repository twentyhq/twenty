import { DateTime } from 'luxon';

import { activeTabIdScopedState } from '@/ui/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { parseDate } from '~/utils/date-utils';

import { TasksContext } from '../states/TasksContext';

export function useTasks() {
  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    TasksContext,
  );

  const { data: completeTasksData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { not: { equals: null } },
      },
    },
  });

  const { data: incompleteTaskData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt:
          activeTabId === 'done' ? { not: { equals: null } } : { equals: null },
      },
    },
  });

  const data = activeTabId === 'done' ? completeTasksData : incompleteTaskData;

  const todayOrPreviousTasks = data?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = DateTime.now().endOf('day').toJSDate();
    return dueDate <= today;
  });

  const upcomingTasks = data?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = DateTime.now().endOf('day').toJSDate();
    return dueDate > today;
  });

  return {
    todayOrPreviousTasks,
    upcomingTasks,
  };
}
