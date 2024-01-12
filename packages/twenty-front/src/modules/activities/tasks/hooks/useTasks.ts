import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { DateTime } from 'luxon';

import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { LeafObjectRecordFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
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

  const isTargettingObjectRecords = isNonEmptyArray(targetableObjects);
  const targetableObjectsFilter =
    targetableObjects.reduce<LeafObjectRecordFilter>(
      (aggregateFilter, targetableObject) => {
        const targetableObjectFieldName = getActivityTargetObjectFieldIdName({
          nameSingular: targetableObject.targetObjectNameSingular,
        });

        if (isNonEmptyString(targetableObject.id)) {
          aggregateFilter[targetableObjectFieldName] = {
            eq: targetableObject.id,
          };
        }

        return aggregateFilter;
      },
      {},
    );

  const { records: activityTargets } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    filter: targetableObjectsFilter,
    skip: !isTargettingObjectRecords,
  });

  const skipRequest = !isNonEmptyArray(activityTargets) && !selectedFilter;

  const idFilter = isTargettingObjectRecords
    ? {
        id: {
          in: activityTargets.map(
            (activityTarget) => activityTarget.activityId,
          ),
        },
      }
    : { id: {} };

  const assigneeIdFilter = selectedFilter
    ? {
        assigneeId: {
          in: JSON.parse(selectedFilter.value),
        },
      }
    : undefined;

  const { records: completeTasksData } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Activity,
    skip: skipRequest,
    filter: {
      completedAt: { is: 'NOT_NULL' },
      ...idFilter,
      type: { eq: 'Task' },
      ...assigneeIdFilter,
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
  });

  const { records: incompleteTaskData } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Activity,
    skip: skipRequest,
    filter: {
      completedAt: { is: 'NULL' },
      ...idFilter,
      type: { eq: 'Task' },
      ...assigneeIdFilter,
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
