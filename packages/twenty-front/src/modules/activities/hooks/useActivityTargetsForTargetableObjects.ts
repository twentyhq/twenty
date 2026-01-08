import { useRecoilValue } from 'recoil';

import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

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
  onCompleted?: (activityTargets: (TaskTarget | NoteTarget)[]) => void;
  activityTargetsOrderByVariables: RecordGqlOperationOrderBy;
  limit: number;
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activityTargetsFilter = getActivityTargetsFilter({
    targetableObjects: targetableObjects,
    activityObjectNameSingular: objectNameSingular,
    objectMetadataItems,
  });

  const FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE =
    findActivityTargetsOperationSignatureFactory({
      objectNameSingular,
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
  } = useFindManyRecords<TaskTarget | NoteTarget>({
    skip,
    objectNameSingular:
      FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE.objectNameSingular,
    filter: activityTargetsFilter,
    recordGqlFields: FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE.fields,
    onCompleted,
    orderBy: activityTargetsOrderByVariables,
    limit,
  });

  return {
    activityTargets,
    loadingActivityTargets,
    totalCountActivityTargets: totalCountActivityTargets ?? 0,
    fetchMoreActivityTargets,
    hasNextPage,
  };
};
