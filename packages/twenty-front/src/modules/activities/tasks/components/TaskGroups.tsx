import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TaskGroupsContent } from '@/activities/tasks/components/TaskGroupsContent';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { CoreObjectNameSingular } from 'twenty-shared/types';

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

  const handleCreateTask = () =>
    openCreateActivity({ targetableObjects: [targetableObject] });

  return (
    <>
      <WidgetHeaderCountEffect count={totalCountTasks} />
      <TaskGroupsContent
        isLoading={tasksLoading}
        onCreateTask={hasObjectUpdatePermissions ? handleCreateTask : undefined}
        tasks={tasks}
      />
    </>
  );
};
