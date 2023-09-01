import { useEffect } from 'react';
import { DateTime } from 'luxon';
import { useRecoilState } from 'recoil';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { useInitializeTasksFilters } from '@/activities/tasks/hooks/useInitializeTasksFilters';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { currentUserState } from '@/auth/states/currentUserState';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { FilterOperand } from '@/ui/filter-n-sort/types/FilterOperand';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { tasksFilters } from '~/pages/tasks/tasks-filters';
import { parseDate } from '~/utils/date-utils';

export function useTasks(entity?: ActivityTargetableEntity) {
  useInitializeTasksFilters({
    availableFilters: tasksFilters,
  });

  const [filters, setFilters] = useRecoilScopedState(
    filtersScopedState,
    TasksRecoilScopeContext,
  );

  // If there is no filter, we set the default filter to the current user
  const [currentUser] = useRecoilState(currentUserState);

  useEffect(() => {
    if (currentUser && !filters.length && !entity) {
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
  }, [currentUser, filters, setFilters, entity]);

  const whereFilters = entity
    ? {
        activityTargets: {
          some: {
            OR: [
              { companyId: { equals: entity.id } },
              { personId: { equals: entity.id } },
            ],
          },
        },
      }
    : Object.assign(
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

  const todayOrPreviousTasks = incompleteTaskData?.findManyActivities.filter(
    (task) => {
      if (!task.dueAt) {
        return false;
      }
      const dueDate = parseDate(task.dueAt).toJSDate();
      const today = DateTime.now().endOf('day').toJSDate();
      return dueDate <= today;
    },
  );

  const upcomingTasks = incompleteTaskData?.findManyActivities.filter(
    (task) => {
      if (!task.dueAt) {
        return false;
      }
      const dueDate = parseDate(task.dueAt).toJSDate();
      const today = DateTime.now().endOf('day').toJSDate();
      return dueDate > today;
    },
  );

  const unscheduledTasks = incompleteTaskData?.findManyActivities.filter(
    (task) => {
      return !task.dueAt;
    },
  );

  const completedTasks = completeTasksData?.findManyActivities;

  return {
    todayOrPreviousTasks,
    upcomingTasks,
    unscheduledTasks,
    completedTasks,
  };
}
