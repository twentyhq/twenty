import { DateTime } from 'luxon';

import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';
import { turnFilterIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFilterIntoWhereClause';
import { SortOrder } from '~/generated/graphql';
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

  const { objects: completeTasksData } = useFindManyObjectRecords({
    objectNamePlural: 'activitiesV2',
    skip: !entity && !selectedFilter,
    filter: {
      type: { equals: 'Task' },
      completedAt: { neq: null },
      ...whereFilters,
    },
    orderBy: [
      {
        createdAt: SortOrder.Desc,
      },
    ],
  });

  const { objects: incompleteTaskData } = useFindManyObjectRecords({
    objectNamePlural: 'activitiesV2',
    skip: !entity && !selectedFilter,
    filter: {
      type: { equals: 'Task' },
      completedAt: { eq: null },
      ...whereFilters,
    },
    orderBy: [
      {
        createdAt: SortOrder.Desc,
      },
    ],
  });

  const todayOrPreviousTasks = incompleteTaskData?.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = DateTime.now().endOf('day').toJSDate();
    return dueDate <= today;
  });

  const upcomingTasks = incompleteTaskData?.filter((task) => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = parseDate(task.dueAt).toJSDate();
    const today = DateTime.now().endOf('day').toJSDate();
    return dueDate > today;
  });

  const unscheduledTasks = incompleteTaskData?.filter((task) => {
    return !task.dueAt;
  });

  const completedTasks = completeTasksData;

  return {
    todayOrPreviousTasks: (todayOrPreviousTasks ?? []) as Activity[],
    upcomingTasks: (upcomingTasks ?? []) as Activity[],
    unscheduledTasks: (unscheduledTasks ?? []) as Activity[],
    completedTasks: (completedTasks ?? []) as Activity[],
  };
};
