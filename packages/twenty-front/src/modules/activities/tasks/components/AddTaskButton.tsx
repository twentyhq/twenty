import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';

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
          type: 'Task',
          targetableEntities: [activityTargetEntity],
        })
      }
    ></Button>
  );
};
