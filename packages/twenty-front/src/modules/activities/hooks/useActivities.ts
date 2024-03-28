import { useEffect, useState } from 'react';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { sortByAscString } from '~/utils/array/sortByAscString';

export const useActivities = ({
  targetableObjects,
  activitiesFilters,
  activitiesOrderByVariables,
  skip,
  skipActivityTargets,
}: {
  targetableObjects: ActivityTargetableObject[];
  activitiesFilters: ObjectRecordQueryFilter;
  activitiesOrderByVariables: OrderByField;
  skip?: boolean;
  skipActivityTargets?: boolean;
}) => {
  const [initialized, setInitialized] = useState(false);

  const { objectMetadataItems } = useObjectMetadataItems();

  const {
    activityTargets,
    loadingActivityTargets,
    initialized: initializedActivityTargets,
  } = useActivityTargetsForTargetableObjects({
    targetableObjects,
    skip: skipActivityTargets || skip,
  });

  const activityIds = activityTargets
    ? [
        ...activityTargets
          .map((activityTarget) => activityTarget.activityId)
          .filter(isNonEmptyString),
      ].sort(sortByAscString)
    : [];

  const activityTargetsFound =
    initializedActivityTargets && isNonEmptyArray(activityTargets);

  const filter: ObjectRecordQueryFilter = {
    id: activityTargetsFound
      ? {
          in: activityIds,
        }
      : undefined,
    ...activitiesFilters,
  };

  const skipActivities =
    skip ||
    (!skipActivityTargets &&
      (!initializedActivityTargets || !activityTargetsFound));

  const targetObjectNameSingularToLoadEagerly = Object.fromEntries(
    objectMetadataItems
      .filter(
        (objectMetadataItem) =>
          objectMetadataItem.isActive && !objectMetadataItem.isSystem,
      )
      .map((objectMetadataItem) => [objectMetadataItem.nameSingular, true]),
  );

  const eagerLoadedRelations: Record<string, any> = {
    activityTargets: {
      activity: true,
      ...targetObjectNameSingularToLoadEagerly,
    },
    assignee: true,
    author: true,
  };

  const { records: activities, loading: loadingActivities } =
    useFindManyRecords<Activity>({
      skip: skipActivities,
      objectNameSingular: CoreObjectNameSingular.Activity,
      depth: 3,
      eagerLoadedRelations,
      filter,
      orderBy: activitiesOrderByVariables,
      onCompleted: useRecoilCallback(
        ({ set }) =>
          (activities) => {
            if (!initialized) {
              setInitialized(true);
            }

            for (const activity of activities) {
              set(recordStoreFamilyState(activity.id), activity);
            }
          },
        [initialized],
      ),
    });

  const loading = loadingActivities || loadingActivityTargets;

  const noActivities =
    (!activityTargetsFound && !skipActivityTargets && initialized) ||
    (initialized && !loading && !isNonEmptyArray(activities));

  useEffect(() => {
    if (skipActivities || noActivities) {
      setInitialized(true);
    }
  }, [
    activities,
    initialized,
    loading,
    noActivities,
    skipActivities,
    skipActivityTargets,
  ]);

  return {
    activities,
    loading,
    initialized,
    noActivities,
  };
};
