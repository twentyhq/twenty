import { activeTabIdScopedState } from '@/ui/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { getWeekYear, parseDate } from '~/utils/date-utils';

import { TasksContext } from '../states/TasksContext';

export function useTasks() {
  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    TasksContext,
  );

  const { data, loading } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt:
          activeTabId === 'done' ? { not: { equals: null } } : { equals: null },
      },
    },
  });

  const todayTasks = data?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = new Date();
    return dueDate.getDate() === today.getDate();
  });

  const thisWeekTasks = data?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = new Date();
    if (dueDate.getDate() === today.getDate()) {
      // Do not show today tasks in this week tasks
      return false;
    }
    const [weekNumber, yearNumber] = getWeekYear(today);
    const [taskWeekNumber, taskYearNumber] = getWeekYear(dueDate);
    return weekNumber === taskWeekNumber && yearNumber === taskYearNumber;
  });

  return {
    todayTasks,
    thisWeekTasks,
    loading,
  };
}
