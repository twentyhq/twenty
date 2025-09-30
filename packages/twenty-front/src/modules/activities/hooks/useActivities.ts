import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { findActivitiesOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivitiesOperationSignatureFactory';
import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { sortByAscString } from '~/utils/array/sortByAscString';

export const useActivities = <T extends Task | Note>({
  objectNameSingular,
  targetableObjects,
  activitiesFilters,
  activitiesOrderByVariables,
  skip,
}: {
  objectNameSingular: CoreObjectNameSingular;
  targetableObjects: ActivityTargetableObject[];
  activitiesFilters: RecordGqlOperationFilter;
  activitiesOrderByVariables: RecordGqlOperationOrderBy;
  skip?: boolean;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const { activityTargets, loadingActivityTargets } =
    useActivityTargetsForTargetableObjects({
      objectNameSingular,
      targetableObjects,
      skip: skip,
    });

  const activityIds = [
    ...new Set(
      activityTargets
        ? [
            ...activityTargets
              .map(
                (activityTarget) =>
                  activityTarget.taskId ?? activityTarget.noteId,
              )
              .filter(isNonEmptyString),
          ].sort(sortByAscString)
        : [],
    ),
  ];

  const skipBecauseNoActivityTargetFound = activityIds.length === 0;

  const filter: RecordGqlOperationFilter = {
    id: {
      in: activityIds,
    },
    ...activitiesFilters,
  };

  const FIND_ACTIVITIES_OPERATION_SIGNATURE =
    findActivitiesOperationSignatureFactory({
      objectMetadataItems,
      objectNameSingular,
    });

  const { records: activities, loading: loadingActivities } =
    useFindManyRecords<Task | Note>({
      skip: skip || loadingActivityTargets || skipBecauseNoActivityTargetFound,
      objectNameSingular:
        FIND_ACTIVITIES_OPERATION_SIGNATURE.objectNameSingular,
      recordGqlFields: FIND_ACTIVITIES_OPERATION_SIGNATURE.fields,
      filter,
      orderBy: activitiesOrderByVariables,
      onCompleted: useRecoilCallback(
        ({ set }) =>
          (activities) => {
            for (const activity of activities) {
              set(recordStoreFamilyState(activity.id), activity);
            }
          },
        [],
      ),
    });

  return {
    activities: activities as T[],
    loading: loadingActivities || loadingActivityTargets,
  };
};
