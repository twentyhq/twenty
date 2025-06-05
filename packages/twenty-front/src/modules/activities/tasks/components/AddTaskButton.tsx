import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetObjectPermissionsForObject } from '@/object-record/hooks/useGetObjectPermissionsForObject';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

export const AddTaskButton = ({
  activityTargetableObject,
}: {
  activityTargetableObject: ActivityTargetableObject;
}) => {
  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: activityTargetableObject.targetObjectNameSingular,
  });

  const getObjectPermissionsForObject = useGetObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const objectPermissions = getObjectPermissionsForObject();

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (!hasObjectUpdatePermissions) {
    return null;
  }

  return (
    <Button
      Icon={IconPlus}
      size="small"
      variant="secondary"
      title="Add task"
      onClick={() =>
        openCreateActivity({
          targetableObjects: [activityTargetableObject],
        })
      }
    />
  );
};
