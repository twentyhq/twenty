import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

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
  } = useActivities<Task>({
    objectNameSingular: CoreObjectNameSingular.Task,
    targetableObjects,
    activityTargetsOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    limit: 200,
  });

  return {
    tasks: (tasks ?? []) as Task[],
    tasksLoading,
    fetchMoreTasks,
    hasNextPage,
    totalCountTasks: totalCountActivities,
  };
};
