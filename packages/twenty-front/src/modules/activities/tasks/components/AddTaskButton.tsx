import { isNonEmptyArray } from '@sniptt/guards';
import { IconPlus } from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Button } from '@/ui/input/button/components/Button';

export const AddTaskButton = ({
  activityTargetableObjects,
}: {
  activityTargetableObjects?: ActivityTargetableObject[];
}) => {
  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  if (!isNonEmptyArray(activityTargetableObjects)) {
    return <></>;
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
    ></Button>
  );
};
