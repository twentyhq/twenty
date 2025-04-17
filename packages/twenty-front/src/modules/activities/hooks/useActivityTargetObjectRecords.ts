import { useRecoilValue } from 'recoil';

import { Note } from '@/activities/types/Note';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { Task } from '@/activities/types/Task';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { getActivityTargetObjectRecords } from '@/activities/utils/getActivityTargetObjectRecords';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from 'twenty-shared/utils';

export const useActivityTargetObjectRecords = (
  activityRecordId?: string,
  activityTargets?: NoteTarget[] | TaskTarget[],
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
