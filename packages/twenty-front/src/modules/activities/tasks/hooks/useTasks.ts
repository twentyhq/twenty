import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type UseTasksProps = {
  targetableObjects: ActivityTargetableObject[];
};

export const useTasks = ({ targetableObjects }: UseTasksProps) => {
  const {
    activities: tasks,
    loading: tasksLoading,
    fetchMoreActivities: fetchMoreTasks,
    hasNextPage,
    totalCountActivities,
  } = useActivities({
    objectNameSingular: CoreObjectNameSingular.Task,
    targetableObjects,
    activityTargetsOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    limit: 200,
  });

  const filteredTasks = tasks.filter(
    (activity): activity is Task => activity.__typename === 'Task',
  );

  const fetchMoreFilteredTasks = async () =>
    (await fetchMoreTasks()).filter(
      (activity): activity is Task => activity.__typename === 'Task',
    );

  return {
    tasks: filteredTasks,
    tasksLoading,
    fetchMoreTasks: fetchMoreFilteredTasks,
    hasNextPage,
    totalCountTasks: totalCountActivities,
  };
};
