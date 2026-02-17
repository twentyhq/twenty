import { useEffect, useMemo } from 'react';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentNotesQueryVariablesStateV2 } from '@/activities/notes/states/currentNotesQueryVariablesStateV2';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { type Note } from '@/activities/types/Note';
import { type RecordGqlOperationVariables } from 'twenty-shared/types';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';

export const useNotes = (targetableObject: ActivityTargetableObject) => {
  const notesQueryVariables = useMemo(
    () =>
      ({
        orderBy: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
      }) as RecordGqlOperationVariables,
    [],
  );

  const {
    activities,
    loading,
    totalCountActivities,
    fetchMoreActivities,
    hasNextPage,
  } = useActivities<Note>({
    objectNameSingular: CoreObjectNameSingular.Note,
    activityTargetsOrderByVariables: notesQueryVariables.orderBy ?? [{}],
    targetableObjects: [targetableObject],
    limit: 10,
  });

  const [currentNotesQueryVariables, setCurrentNotesQueryVariables] =
    useRecoilStateV2(currentNotesQueryVariablesStateV2);

  // TODO: fix useEffect, remove with better pattern
  useEffect(() => {
    if (!isDeeplyEqual(notesQueryVariables, currentNotesQueryVariables)) {
      setCurrentNotesQueryVariables(notesQueryVariables);
    }
  }, [
    notesQueryVariables,
    currentNotesQueryVariables,
    setCurrentNotesQueryVariables,
  ]);

  return {
    notes: activities as Note[],
    loading,
    totalCountNotes: totalCountActivities,
    fetchMoreNotes: fetchMoreActivities,
    hasNextPage,
  };
};
