import { DateTime } from 'luxon';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/ui/view-bar/utils/turnFilterIntoWhereClause';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { parseDate } from '~/utils/date-utils';

export function useTasks(entity?: ActivityTargetableEntity) {
  const [filters] = useRecoilScopedState(
    filtersScopedState,
    TasksRecoilScopeContext,
  );

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
    skip: filters.length === 0,
  });

  const { data: incompleteTaskData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { equals: null },
        ...whereFilters,
      },
    },
    skip: filters.length === 0,
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
