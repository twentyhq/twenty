import { isNonEmptyArray } from '@sniptt/guards';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { IconPlus } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { Button } from '@/ui/input/button/components/Button';

export const AddTaskButton = ({
  activityTargetableObjects,
}: {
  activityTargetableObjects?: ActivityTargetableObject[];
}) => {
  const { translate } = useI18n('translations');
  const openCreateActivity = useOpenCreateActivityDrawer();

  if (!isNonEmptyArray(activityTargetableObjects)) {
    return <></>;
  }

  return (
    <Button
      Icon={IconPlus}
      size="small"
      variant="secondary"
      title={translate('addTask')}
      onClick={() =>
        openCreateActivity({
          type: 'Task',
          targetableObjects: activityTargetableObjects,
        })
      }
    ></Button>
  );
};
