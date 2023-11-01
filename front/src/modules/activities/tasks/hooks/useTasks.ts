import { DateTime } from 'luxon';

import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';
import { turnFilterIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFilterIntoWhereClause';
import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';
import { parseDate } from '~/utils/date-utils';

export const useTasks = (entity?: ActivityTargetableEntity) => {
  const { selectedFilter } = useFilter();

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
    : Object.assign({}, turnFilterIntoWhereClause(selectedFilter));

  const { data: completeTasksData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { not: { equals: null } },
        ...whereFilters,
      },
    },
    skip: !entity && !selectedFilter,
  });

  const { data: incompleteTaskData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Task },
        completedAt: { equals: null },
        ...whereFilters,
      },
    },
    skip: !entity && !selectedFilter,
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
    todayOrPreviousTasks: todayOrPreviousTasks ?? [],
    upcomingTasks: upcomingTasks ?? [],
    unscheduledTasks: unscheduledTasks ?? [],
    completedTasks: completedTasks ?? [],
  };
};
