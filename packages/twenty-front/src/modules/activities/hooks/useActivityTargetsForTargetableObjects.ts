import {
  type CoreObjectNameSingular,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type ActivityTarget } from '@/activities/types/ActivityTarget';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

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

  const morphJunctionConfig = useObjectMorphJunctionConfig({ objectNameSingular });

  if (!isDefined(morphJunctionConfig)) {
    throw new Error('Activity target junction metadata is missing');
  }

  const { junctionObjectMetadata, sourceField } =
    morphJunctionConfig;

  const activityTargetsFilter = getActivityTargetsFilter({
    targetableObjects,
    activityTargetObjectMetadata: junctionObjectMetadata,
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
    onCompleted: (records) =>
      onCompleted?.(records, sourceField.name),
    orderBy: activityTargetsOrderByVariables,
    limit,
  });

  return {
    activityTargets,
    loadingActivityTargets,
    totalCountActivityTargets: totalCountActivityTargets ?? 0,
    fetchMoreActivityTargets,
    hasNextPage,
    activityRelationFieldName: sourceField.name,
  };
};
