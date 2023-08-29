import { useTheme } from '@emotion/react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { Button } from '@/ui/button/components/Button';
import { IconPlus } from '@/ui/icon';
import { ActivityType } from '~/generated/graphql';

export function AddTaskButton({
  entity,
}: {
  entity?: ActivityTargetableEntity;
}) {
  const theme = useTheme();
  const openCreateActivity = useOpenCreateActivityDrawer();

  if (!entity) {
    return <></>;
  }

  return (
    <Button
      icon={<IconPlus size={theme.icon.size.md} />}
      size="small"
      variant="secondary"
      title="Add task"
      onClick={() => openCreateActivity(ActivityType.Task, [entity])}
    ></Button>
  );
}
