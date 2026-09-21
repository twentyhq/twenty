import { useEffect, useMemo } from 'react';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { type Note } from '@/activities/types/Note';
import {
  CoreObjectNameSingular,
  type RecordGqlOperationVariables,
} from 'twenty-shared/types';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

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
  } = useActivities({
    objectNameSingular: CoreObjectNameSingular.Note,
    activityTargetsOrderByVariables: notesQueryVariables.orderBy ?? [{}],
    targetableObjects: [targetableObject],
    limit: 10,
  });

  const notes = activities.filter(
    (activity): activity is Note => activity.__typename === 'Note',
  );

  const fetchMoreNotes = async () =>
    (await fetchMoreActivities()).filter(
      (activity): activity is Note => activity.__typename === 'Note',
    );

  const [currentNotesQueryVariables, setCurrentNotesQueryVariables] =
    useAtomState(currentNotesQueryVariablesState);

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
    notes,
    loading,
    totalCountNotes: totalCountActivities,
    fetchMoreNotes,
    hasNextPage,
  };
};
