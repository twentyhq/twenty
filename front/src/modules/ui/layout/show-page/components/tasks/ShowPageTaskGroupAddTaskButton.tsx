import { useTheme } from '@emotion/react';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/ui/button/components/Button';
import { IconPlus } from '@/ui/icon';
import { ActivityType } from '~/generated/graphql';

export function ShowPageTaskGroupAddTaskButton({
  entity,
}: {
  entity: ActivityTargetableEntity;
}) {
  const theme = useTheme();
  const openCreateActivity = useOpenCreateActivityDrawer();
  return (
    <Button
      icon={<IconPlus size={theme.icon.size.md} />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Secondary}
      title="Add task"
      onClick={() => openCreateActivity(ActivityType.Task, [entity])}
    ></Button>
  );
}
