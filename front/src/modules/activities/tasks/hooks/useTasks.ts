import { isNonEmptyString } from '@sniptt/guards';
import { DateTime } from 'luxon';
import { undefined } from 'zod';

import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { parseDate } from '~/utils/date-utils';
import { isDefined } from '~/utils/isDefined';

type UseTasksProps = {
  filterDropdownId?: string;
  entity?: ActivityTargetableEntity;
};

export const useTasks = (props?: UseTasksProps) => {
  const { filterDropdownId, entity } = props ?? {};

  const { selectedFilter } = useFilterDropdown({
    filterDropdownId: filterDropdownId,
  });

  const { records: activityTargets } = useFindManyRecords({
    objectNameSingular: 'activityTarget',
    filter: isDefined(entity)
      ? {
          [entity?.type === 'Company' ? 'companyId' : 'personId']: {
            eq: entity?.id,
          },
        }
      : undefined,
  });

  const { records: completeTasksData } = useFindManyRecords({
    objectNameSingular: 'activity',
    skip: !entity && !selectedFilter,
    filter: {
      completedAt: { is: 'NOT_NULL' },
      id: isDefined(entity)
        ? {
            in: activityTargets?.map(
              (activityTarget) => activityTarget.activityId,
            ),
          }
        : undefined,
      type: { eq: 'Task' },
      assigneeId: isNonEmptyString(selectedFilter?.value)
        ? {
            eq: selectedFilter?.value,
          }
        : undefined,
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
  });

  const { records: incompleteTaskData } = useFindManyRecords({
    objectNameSingular: 'activity',
    skip: !entity && !selectedFilter,
    filter: {
      completedAt: { is: 'NULL' },
      id: isDefined(entity)
        ? {
            in: activityTargets?.map(
              (activityTarget) => activityTarget.activityId,
            ),
          }
        : undefined,
      type: { eq: 'Task' },
      assigneeId: isNonEmptyString(selectedFilter?.value)
        ? {
            eq: selectedFilter?.value,
          }
        : undefined,
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
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
