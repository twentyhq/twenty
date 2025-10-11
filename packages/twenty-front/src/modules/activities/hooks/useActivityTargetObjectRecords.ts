import { useRecoilValue } from 'recoil';

import { type Note } from '@/activities/types/Note';
import { type NoteTarget } from '@/activities/types/NoteTarget';
import { type Task } from '@/activities/types/Task';
import { type TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectRecords } from '@/activities/utils/getActivityTargetObjectRecords';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useActivityTargetObjectRecords = (
  activityRecordId?: string,
  activityTargets?: Nullable<NoteTarget[] | TaskTarget[]>,
) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activity = useRecoilValue(
    recordStoreFamilyState(activityRecordId ?? ''),
  ) as Note | Task | null;

  if (!isDefined(activity) && !isDefined(activityTargets)) {
    return { activityTargetObjectRecords: [] };
  }

  const activityTargetObjectRecords = getActivityTargetObjectRecords({
    activityRecord: activity as Note | Task,
    objectMetadataItems,
    activityTargets,
  });

  return {
    activityTargetObjectRecords,
  };
};
