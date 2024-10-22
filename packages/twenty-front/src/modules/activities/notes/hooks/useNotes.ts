import { useEffect, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { Note } from '@/activities/types/Note';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ActivityTargetableObject } from '../../types/ActivityTargetableEntity';

export const useNotes = (targetableObject: ActivityTargetableObject) => {
  const notesQueryVariables = useMemo(
    () =>
      ({
        filter: {},
        orderBy: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
      }) as RecordGqlOperationVariables,
    [],
  );

  const { activities, loading } = useActivities<Note>({
    objectNameSingular: CoreObjectNameSingular.Note,
    activitiesFilters: notesQueryVariables.filter ?? {},
    activitiesOrderByVariables: notesQueryVariables.orderBy ?? [{}],
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
    loading,
  };
};
