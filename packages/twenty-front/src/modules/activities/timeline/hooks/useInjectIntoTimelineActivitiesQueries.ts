import { useInjectIntoActivitiesQueries } from '@/activities/hooks/useInjectIntoActivitiesQueries';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

export const useInjectIntoTimelineActivitiesQueries = () => {
  const { injectActivitiesQueries } = useInjectIntoActivitiesQueries();

  const injectIntoTimelineActivitiesQueries = ({
    activityToInject,
    activityTargetsToInject,
    timelineTargetableObject,
  }: {
    activityToInject: Activity;
    activityTargetsToInject: ActivityTarget[];
    timelineTargetableObject: ActivityTargetableObject;
  }) => {
    injectActivitiesQueries({
      activitiesFilters: {},
      activitiesOrderByVariables: {
        createdAt: 'DescNullsFirst',
      },
      activityTargetsToInject,
      activityToInject,
      targetableObjects: [timelineTargetableObject],
    });
  };

  return {
    injectIntoTimelineActivitiesQueries,
  };
};
