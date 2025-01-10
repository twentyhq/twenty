import { isNonEmptyArray } from '@sniptt/guards';
import { Button, IconPlus } from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTranslation } from 'react-i18next';

export const AddTaskButton = ({
  activityTargetableObjects,
}: {
  activityTargetableObjects?: ActivityTargetableObject[];
}) => {
  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const { t } = useTranslation();

  if (!isNonEmptyArray(activityTargetableObjects)) {
    return <></>;
  }

  return (
    <Button
      Icon={IconPlus}
      size="small"
      variant="secondary"
      title={t('addTask')}
      onClick={() =>
        openCreateActivity({
          targetableObjects: activityTargetableObjects,
        })
      }
    ></Button>
  );
};
