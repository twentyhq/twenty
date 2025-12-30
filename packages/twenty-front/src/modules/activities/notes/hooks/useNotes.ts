import { useEffect, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline-activities/constants/FindManyTimelineActivitiesOrderBy';
import { type Note } from '@/activities/types/Note';
import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';

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
    totalCountNotes: totalCountActivities,
    fetchMoreNotes: fetchMoreActivities,
    hasNextPage,
  };
};
