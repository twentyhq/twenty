import { isNonEmptyArray } from '@sniptt/guards';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { Button } from 'twenty-ui/input';
import { IconPlus } from 'twenty-ui/display';

export const AddTaskButton = ({
  activityTargetableObjects,
}: {
  activityTargetableObjects?: ActivityTargetableObject[];
}) => {
  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  if (
    !isNonEmptyArray(activityTargetableObjects) ||
    hasObjectReadOnlyPermission
  ) {
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
          targetableObjects: activityTargetableObjects,
        })
      }
    />
  );
};
