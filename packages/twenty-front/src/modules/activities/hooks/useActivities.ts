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
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
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
    loadingActivityTargets,
    totalCountActivityTargets,
    fetchMoreActivityTargets,
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

  const fetchMoreActivities = async () => {
    const result = await fetchMoreActivityTargets();

    if (!isDefined(result?.data)) {
      return [];
    }

    const activityTargets = getRecordsFromRecordConnection<ActivityTarget>({
      recordConnection: result.data,
    });

    updateActivitiesInStore(activityTargets, activityRelationFieldName);

    return activityTargets
      .map((activityTarget) => {
        return getRelatedRecordFromJunction({
          junctionRecord: activityTarget,
          relationFieldName: activityRelationFieldName,
        });
      })
      .filter(isDefined);
  };

  return {
    activities,
    loading: loadingActivityTargets,
    totalCountActivities: totalCountActivityTargets,
    fetchMoreActivities,
    hasNextPage,
  };
};
