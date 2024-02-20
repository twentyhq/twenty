import { isNonEmptyArray } from '@sniptt/guards';
import { DateTime } from 'luxon';

import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { parseDate } from '~/utils/date-utils';

type UseTasksProps = {
  filterDropdownId?: string;
  targetableObjects: ActivityTargetableObject[];
};

export const useTasks = ({
  targetableObjects,
  filterDropdownId,
}: UseTasksProps) => {
  const { selectedFilter } = useFilterDropdown({
    filterDropdownId,
  });

  const assigneeIdFilter = selectedFilter
    ? {
        assigneeId: {
          in: JSON.parse(selectedFilter.value),
        },
      }
    : undefined;

  const skipActivityTargets = !isNonEmptyArray(targetableObjects);

  const {
    activities: completeTasksData,
    initialized: initializedCompleteTasks,
  } = useActivities({
    targetableObjects,
    activitiesFilters: {
      completedAt: { is: 'NOT_NULL' },
      type: { eq: 'Task' },
      ...assigneeIdFilter,
    },
    activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    skipActivityTargets,
  });

  const {
    activities: incompleteTaskData,
    initialized: initializedIncompleteTasks,
  } = useActivities({
    targetableObjects,
    activitiesFilters: {
      completedAt: { is: 'NULL' },
      type: { eq: 'Task' },
      ...assigneeIdFilter,
    },
    activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    skipActivityTargets,
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
    initialized: initializedCompleteTasks && initializedIncompleteTasks,
  };
};
