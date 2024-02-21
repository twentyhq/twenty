import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY';
import { Note } from '@/activities/types/Note';

import { ActivityTargetableObject } from '../../types/ActivityTargetableEntity';

export const useNotes = (targetableObject: ActivityTargetableObject) => {
  const { activities, initialized, loading } = useActivities({
    activitiesFilters: {
      type: { eq: 'Note' },
    },
    activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    targetableObjects: [targetableObject],
  });

  return {
    notes: activities as Note[],
    initialized,
    loading,
  };
};
