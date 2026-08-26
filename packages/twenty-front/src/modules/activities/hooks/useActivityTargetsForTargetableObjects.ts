import {
  type CoreObjectNameSingular,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type ActivityTarget } from '@/activities/types/ActivityTarget';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useActivityTargetsForTargetableObjects = ({
  objectNameSingular,
  targetableObjects,
  skip,
  onCompleted,
  activityTargetsOrderByVariables,
  limit,
}: {
  objectNameSingular: CoreObjectNameSingular.Note | CoreObjectNameSingular.Task;
  targetableObjects: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >[];
  skip?: boolean;
  onCompleted?: (
    activityTargets: ActivityTarget[],
    activityRelationFieldName: string,
  ) => void;
  activityTargetsOrderByVariables: RecordGqlOperationOrderBy;
  limit: number;
}) => {
  const objectMetadataItems = useAtomStateValue<EnrichedObjectMetadataItem[]>(
    objectMetadataItemsSelector,
  );
  const FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE =
    findActivityTargetsOperationSignatureFactory({
      objectNameSingular,
      objectMetadataItems,
    });

  const activityTargetObjectMetadata = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular ===
      FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE.objectNameSingular,
  );

  if (!activityTargetObjectMetadata) {
    throw new Error('Activity target object metadata is missing');
  }

  const activityObjectMetadata = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  const activityRelationFieldName = activityTargetObjectMetadata.fields.find(
    (fieldMetadataItem) =>
      fieldMetadataItem.relation?.targetObjectMetadata.id ===
      activityObjectMetadata?.id,
  )?.name;

  if (!activityRelationFieldName) {
    throw new Error('Activity relation metadata is missing');
  }

  const activityTargetsFilter = getActivityTargetsFilter({
    targetableObjects,
    activityTargetObjectMetadata,
    objectMetadataItems,
  });

  // TODO: We want to optimistically remove from this request
  //   If we are on a show page and we remove the current show page object corresponding activity target
  //   See also if we need to update useTimelineActivities
  const {
    records: activityTargets,
    loading: loadingActivityTargets,
    totalCount: totalCountActivityTargets,
    fetchMoreRecords: fetchMoreActivityTargets,
    hasNextPage,
  } = useFindManyRecords<ActivityTarget>({
    skip,
    objectNameSingular:
      FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE.objectNameSingular,
    filter: activityTargetsFilter,
    recordGqlFields: FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE.fields,
    onCompleted: (records) => onCompleted?.(records, activityRelationFieldName),
    orderBy: activityTargetsOrderByVariables,
    limit,
  });

  return {
    activityTargets,
    loadingActivityTargets,
    totalCountActivityTargets: totalCountActivityTargets ?? 0,
    fetchMoreActivityTargets,
    hasNextPage,
    activityRelationFieldName,
  };
};
