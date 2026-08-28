import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type ActivityTarget } from '@/activities/types/ActivityTarget';
import { getRelatedRecordFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordFromJunction';
import {
  type CoreObjectNameSingular,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from 'twenty-shared/utils';

export const useActivities = ({
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
    (activityTargets: ActivityTarget[], activityRelationFieldName: string) => {
      for (const activityTarget of activityTargets) {
        const activity = getRelatedRecordFromJunction({
          junctionRecord: activityTarget,
          relationFieldName: activityRelationFieldName,
        });

        if (!isDefined(activity)) {
          continue;
        }

        store.set(recordStoreFamilyState.atomFamily(activity.id), activity);
      }
    },
    [store],
  );

  const {
    activityTargets,
    totalCountActivityTargets,
    fetchMoreActivityTargets,
    isFetchingMoreActivityTargets,
    hasNextPage,
    activityRelationFieldName,
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
      return getRelatedRecordFromJunction({
        junctionRecord: activityTarget,
        relationFieldName: activityRelationFieldName,
      });
    })
    .filter(isDefined);

  // The onCompleted handler re-runs when fetchMore merges new pages into the
  // query data, so the record store picks up the appended activities without
  // a manual write here.
  const fetchMoreActivities = async () => {
    await fetchMoreActivityTargets();
  };

  return {
    activities,
    totalCountActivities: totalCountActivityTargets,
    fetchMoreActivities,
    isFetchingMoreActivities: isFetchingMoreActivityTargets,
    hasNextPage,
  };
};
