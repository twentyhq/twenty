import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TaskGroupsContent } from '@/activities/tasks/components/TaskGroupsContent';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';

type TaskGroupsProps = {
  filterDropdownId?: string;
  targetableObject: ActivityTargetableObject;
};

export const TaskGroups = ({ targetableObject }: TaskGroupsProps) => {
  const { tasks, tasksLoading, totalCountTasks } = useTasks({
    targetableObjects: [targetableObject],
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const newTaskAction = useMemo(
    () =>
      hasObjectUpdatePermissions
        ? {
            id: 'new-task',
            Icon: IconPlus,
            label: t`New task`,
            onClick: () =>
              openCreateActivity({ targetableObjects: [targetableObject] }),
          }
        : undefined,
    [hasObjectUpdatePermissions, openCreateActivity, targetableObject],
  );

  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const isLoading =
    (activeTabId !== 'done' && tasksLoading) ||
    (activeTabId === 'done' && tasksLoading);

  return (
    <>
      <WidgetHeaderInfoEffect
        count={totalCountTasks}
        actions={isDefined(newTaskAction) ? [newTaskAction] : undefined}
      />
      <TaskGroupsContent
        isLoading={isLoading}
        onCreateTask={newTaskAction?.onClick}
        tasks={tasks}
      />
    </>
  );
};
