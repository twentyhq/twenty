import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

type UseTasksProps = {
  targetableObjects: ActivityTargetableObject[];
};

export const useTasks = ({ targetableObjects }: UseTasksProps) => {
  const { activities: tasks, loading: tasksLoading } = useActivities<Task>({
    objectNameSingular: CoreObjectNameSingular.Task,
    targetableObjects,
    activitiesFilters: {},
    activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
  });

  return {
    tasks: (tasks ?? []) as Task[],
    tasksLoading,
  };
};
