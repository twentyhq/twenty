import { useRecoilValue } from 'recoil';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  const objectMetadataItems = useRecoilValue<ObjectMetadataItem[]>(
    objectMetadataItemsState,
  );
  const isNoteTargetMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_NOTE_TARGET_MIGRATED,
  );
  const isTaskTargetMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_TASK_TARGET_MIGRATED,
  );
  const isMorphRelation =
    objectNameSingular === CoreObjectNameSingular.Task
      ? isTaskTargetMigrated
      : isNoteTargetMigrated;

  const activityTargetsFilter = getActivityTargetsFilter({
    targetableObjects: targetableObjects,
    activityObjectNameSingular: objectNameSingular,
    objectMetadataItems,
    isMorphRelation,
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
