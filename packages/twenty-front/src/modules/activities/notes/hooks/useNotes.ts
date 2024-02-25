import { useEffect, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FindManyTimelineActivitiesOrderBy';
import { Note } from '@/activities/types/Note';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { ActivityTargetableObject } from '../../types/ActivityTargetableEntity';

export const useNotes = (targetableObject: ActivityTargetableObject) => {
  const notesQueryVariables = useMemo(
    () =>
      ({
        filter: {
          type: { eq: 'Note' },
        },
        orderBy: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
      }) as ObjectRecordQueryVariables,
    [],
  );

  const { activities, initialized, loading } = useActivities({
    activitiesFilters: notesQueryVariables.filter ?? {},
    activitiesOrderByVariables: notesQueryVariables.orderBy ?? {},
    targetableObjects: [targetableObject],
  });

  const [currentNotesQueryVariables, setCurrentNotesQueryVariables] =
    useRecoilState(currentNotesQueryVariablesState);

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
    initialized,
    loading,
  };
};
