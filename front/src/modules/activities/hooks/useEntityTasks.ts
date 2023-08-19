import { DateTime } from 'luxon';

import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { tasksFilters } from '~/pages/tasks/tasks-filters';
import { parseDate } from '~/utils/date-utils';

import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';

import { useInitializeTasksFilters } from './useInitializeTasksFilters';

export function useEntityTasks(entity: ActivityTargetableEntity) {
  useInitializeTasksFilters({
    availableFilters: tasksFilters,
  });

  const { data: incompleteTaskData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { equals: null },
        activityTargets: {
          some: {
            OR: [
              { companyId: { equals: entity.id } },
              { personId: { equals: entity.id } },
            ],
          },
        },
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

  return {
    todayOrPreviousTasks,
    upcomingTasks,
    unscheduledTasks,
  };
}
