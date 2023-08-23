import { useEffect } from 'react';
import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { FilterOperand } from '@/ui/filter-n-sort/types/FilterOperand';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { activeTabIdScopedState } from '@/ui/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { tasksFilters } from '~/pages/tasks/tasks-filters';
import { parseDate } from '~/utils/date-utils';

import { TasksRecoilScopeContext } from '../states/recoil-scope-contexts/TasksRecoilScopeContext';

import { useInitializeTasksFilters } from './useInitializeTasksFilters';

export function useTasks() {
  useInitializeTasksFilters({
    availableFilters: tasksFilters,
  });

  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    TasksRecoilScopeContext,
  );

  const [filters, setFilters] = useRecoilScopedState(
    filtersScopedState,
    TasksRecoilScopeContext,
  );

  // If there is no filter, we set the default filter to the current user
  const [currentUser] = useRecoilState(currentUserState);

  useEffect(() => {
    if (currentUser && !filters.length) {
      setFilters([
        {
          key: 'assigneeId',
          type: 'entity',
          value: currentUser.id,
          operand: FilterOperand.Is,
          displayValue: currentUser.displayName,
          displayAvatarUrl: currentUser.avatarUrl ?? undefined,
        },
      ]);
    }
  }, [currentUser, filters, setFilters]);

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

  const unscheduledTasks = tasksData?.findManyActivities.filter((task) => {
    return !task.dueAt;
  });

  return {
    todayOrPreviousTasks,
    upcomingTasks,
    unscheduledTasks,
  };
}
