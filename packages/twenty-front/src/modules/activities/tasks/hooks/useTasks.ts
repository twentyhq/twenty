import { useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentCompletedTaskQueryVariablesState } from '@/activities/tasks/states/currentCompletedTaskQueryVariablesState';
import { currentIncompleteTaskQueryVariablesState } from '@/activities/tasks/states/currentIncompleteTaskQueryVariablesState';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FindManyTimelineActivitiesOrderBy';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { parseDate } from '~/utils/date-utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type UseTasksProps = {
  filterDropdownId?: string;
  targetableObjects: ActivityTargetableObject[];
};

export const useTasks = ({
  targetableObjects,
  filterDropdownId,
}: UseTasksProps) => {
  const { selectedFilterState } = useFilterDropdown({
    filterDropdownId,
  });

  const selectedFilter = useRecoilValue(selectedFilterState);

  const assigneeIdFilter = useMemo(
    () =>
      selectedFilter
        ? {
            assigneeId: {
              in: JSON.parse(selectedFilter.value),
            },
          }
        : undefined,
    [selectedFilter],
  );

  const completedQueryVariables = useMemo(
    () =>
      ({
        filter: {
          completedAt: { is: 'NOT_NULL' },
          type: { eq: 'Task' },
          ...assigneeIdFilter,
        },
        orderBy: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
      }) as RecordGqlOperationVariables,
    [assigneeIdFilter],
  );

  const incompleteQueryVariables = useMemo(
    () =>
      ({
        filter: {
          completedAt: { is: 'NULL' },
          type: { eq: 'Task' },
          ...assigneeIdFilter,
        },
        orderBy: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
      }) as RecordGqlOperationVariables,
    [assigneeIdFilter],
  );

  const [
    currentCompletedTaskQueryVariables,
    setCurrentCompletedTaskQueryVariables,
  ] = useRecoilState(currentCompletedTaskQueryVariablesState);

  const [
    currentIncompleteTaskQueryVariables,
    setCurrentIncompleteTaskQueryVariables,
  ] = useRecoilState(currentIncompleteTaskQueryVariablesState);

  // TODO: fix useEffect, remove with better pattern
  useEffect(() => {
    if (
      !isDeeplyEqual(
        completedQueryVariables,
        currentCompletedTaskQueryVariables,
      )
    ) {
      setCurrentCompletedTaskQueryVariables(completedQueryVariables);
    }
  }, [
    completedQueryVariables,
    currentCompletedTaskQueryVariables,
    setCurrentCompletedTaskQueryVariables,
  ]);

  useEffect(() => {
    if (
      !isDeeplyEqual(
        incompleteQueryVariables,
        currentIncompleteTaskQueryVariables,
      )
    ) {
      setCurrentIncompleteTaskQueryVariables(incompleteQueryVariables);
    }
  }, [
    incompleteQueryVariables,
    currentIncompleteTaskQueryVariables,
    setCurrentIncompleteTaskQueryVariables,
  ]);

  const { activities: completeTasksData } = useActivities({
    targetableObjects,
    activitiesFilters: completedQueryVariables.filter ?? {},
    activitiesOrderByVariables: completedQueryVariables.orderBy ?? [{}],
  });

  const { activities: incompleteTaskData } = useActivities({
    targetableObjects,
    activitiesFilters: incompleteQueryVariables.filter ?? {},
    activitiesOrderByVariables: incompleteQueryVariables.orderBy ?? [{}],
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
