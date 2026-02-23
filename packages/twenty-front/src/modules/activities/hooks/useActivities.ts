import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useActivities = <T extends Task | Note>({
  objectNameSingular,
  targetableObjects,
  activityTargetsOrderByVariables,
  skip,
  limit,
}: {
  objectNameSingular: CoreObjectNameSingular.Note | CoreObjectNameSingular.Task;
  targetableObjects: ActivityTargetableObject[];
  activityTargetsOrderByVariables: RecordGqlOperationOrderBy;
  skip?: boolean;
  limit: number;
}) => {
  const store = useStore();
  const updateActivitiesInStore = useCallback(
    (activityTargets: (TaskTarget | NoteTarget)[]) => {
      for (const activityTarget of activityTargets) {
        const activity = activityTarget[objectNameSingular];
        store.set(recordStoreFamilyState.atomFamily(activity.id), activity);
      }
    },
    [store, objectNameSingular],
  );

  const {
    activityTargets,
    loadingActivityTargets,
    totalCountActivityTargets,
    fetchMoreActivityTargets,
    hasNextPage,
  } = useActivityTargetsForTargetableObjects({
    objectNameSingular,
    targetableObjects,
    skip: skip,
    activityTargetsOrderByVariables,
    onCompleted: updateActivitiesInStore,
    limit,
  });

  const activities = activityTargets
    .map((activityTarget) => {
      return activityTarget[objectNameSingular];
    })
    .filter(isDefined) as T[];

  const fetchMoreActivities = async () => {
    const result = await fetchMoreActivityTargets();

    if (!isDefined(result?.data)) {
      return [];
    }

    const activityTargets = getRecordsFromRecordConnection<
      TaskTarget | NoteTarget
    >({
      recordConnection: result.data,
    });

    updateActivitiesInStore(activityTargets);

    return activityTargets
      .map((activityTarget) => {
        return activityTarget[objectNameSingular];
      })
      .filter(isDefined) as T[];
  };

  return {
    activities: activities as T[],
    loading: loadingActivityTargets,
    totalCountActivities: totalCountActivityTargets,
    fetchMoreActivities,
    hasNextPage,
  };
};
