import { activeTabIdScopedState } from '@/ui/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ActivityType, useGetActivitiesByTypeQuery } from '~/generated/graphql';
import { getWeekYear, parseDate } from '~/utils/date-utils';

import { TasksContext } from '../states/TasksContext';

export function useTasks() {
  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    TasksContext,
  );
  const { data, loading } = useGetActivitiesByTypeQuery({
    variables: { type: ActivityType.Task },
  });

  const todayTasks = data?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const parsedDate = parseDate(task.dueAt).toJSDate();
    const today = new Date();
    return parsedDate.getDate() === today.getDate();
  });

  const thisWeekTasks = data?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const parsedDate = parseDate(task.dueAt).toJSDate();
    const today = new Date();
    if (parsedDate.getDate() === today.getDate()) {
      // Do not show today tasks in this week tasks
      return false;
    }
    const [weekNumber, yearNumber] = getWeekYear(today);
    const [taskWeekNumber, taskYearNumber] = getWeekYear(task.dueAt);
    return weekNumber === taskWeekNumber && yearNumber === taskYearNumber;
  });

  return {
    todayTasks,
    thisWeekTasks,
    loading,
  };
}
