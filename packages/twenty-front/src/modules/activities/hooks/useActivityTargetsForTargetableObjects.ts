import { useRecoilValue } from 'recoil';

import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useActivityTargetsForTargetableObjects = ({
  objectNameSingular,
  targetableObjects,
  skip,
  onCompleted,
}: {
  objectNameSingular: CoreObjectNameSingular;
  targetableObjects: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >[];
  skip?: boolean;
  onCompleted?: (activityTargets: (TaskTarget | NoteTarget)[]) => void;
}) => {
  const activityTargetsFilter = getActivityTargetsFilter({
    targetableObjects: targetableObjects,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE =
    findActivityTargetsOperationSignatureFactory({
      objectNameSingular,
      objectMetadataItems,
    });

  // TODO: We want to optimistically remove from this request
  //   If we are on a show page and we remove the current show page object corresponding activity target
  //   See also if we need to update useTimelineActivities
  const { records: activityTargets, loading: loadingActivityTargets } =
    useFindManyRecords<TaskTarget | NoteTarget>({
      skip,
      objectNameSingular:
        FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE.objectNameSingular,
      filter: activityTargetsFilter,
      recordGqlFields: FIND_ACTIVITY_TARGETS_OPERATION_SIGNATURE.fields,
      onCompleted,
    });

  return {
    activityTargets,
    loadingActivityTargets,
  };
};
