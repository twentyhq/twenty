import { DateTime } from 'luxon';

import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { activeTabIdScopedState } from '@/ui/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { tasksFilters } from '~/pages/tasks/tasks-filters';
import { parseDate } from '~/utils/date-utils';

import { TasksContext } from '../states/TasksContext';

import { useInitializeTasksFilters } from './useInitializeTasksFilters';

export function useTasks() {
  useInitializeTasksFilters({
    availableFilters: tasksFilters,
  });

  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    TasksContext,
  );

  const filters = useRecoilScopedValue(filtersScopedState, TasksContext);
  const whereFilters = Object.assign(
    {},
    ...filters.map((filter) => {
      return turnFilterIntoWhereClause(filter);
    }),
  );

  const { data: completeTasksData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { not: { equals: null } },
        ...whereFilters,
      },
    },
  });

  const { data: incompleteTaskData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { equals: null },
        ...whereFilters,
      },
    },
  });

  const tasksData =
    activeTabId === 'done' ? completeTasksData : incompleteTaskData;

  const todayOrPreviousTasks = tasksData?.findManyActivities.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = DateTime.now().endOf('day').toJSDate();
    return dueDate <= today;
  });

  const upcomingTasks = tasksData?.findManyActivities.filter((task) => {
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
