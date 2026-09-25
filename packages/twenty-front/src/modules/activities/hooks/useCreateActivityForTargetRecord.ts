import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useCanUpdateObjectRecords } from '@/object-record/hooks/useCanUpdateObjectRecords';
import { type CoreObjectNameSingular } from 'twenty-shared/types';

type UseCreateActivityForTargetRecordParams = {
  targetRecord: ActivityTargetableObject;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
};

// Creating an activity attaches it to the target record, so it requires
// update permission on the target object, not just create permission on the
// activity object.
export const useCreateActivityForTargetRecord = ({
  targetRecord,
  activityObjectNameSingular,
}: UseCreateActivityForTargetRecordParams) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });
  const { canUpdateObjectRecords } = useCanUpdateObjectRecords(
    targetRecord.targetObjectNameSingular,
  );

  const openCreateActivityDrawer = useOpenCreateActivityDrawer({
    activityObjectNameSingular,
  });

  const createActivity = () =>
    openCreateActivityDrawer({ targetableObjects: [targetRecord] });

  return {
    canCreateActivity:
      canUpdateObjectRecords &&
      !isObjectMetadataReadOnly({ objectMetadataItem }),
    createActivity,
  };
};
