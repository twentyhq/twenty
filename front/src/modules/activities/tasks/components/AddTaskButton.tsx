import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { IconPlus } from '@/ui/Display/Icon';
import { Button } from '@/ui/Input/Button/components/Button';
import { ActivityType } from '~/generated/graphql';

export const AddTaskButton = ({
  activityTargetEntity,
}: {
  activityTargetEntity?: ActivityTargetableEntity;
}) => {
  const openCreateActivity = useOpenCreateActivityDrawer();

  if (!activityTargetEntity) {
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
          type: ActivityType.Task,
          targetableEntities: [activityTargetEntity],
        })
      }
    ></Button>
  );
};
