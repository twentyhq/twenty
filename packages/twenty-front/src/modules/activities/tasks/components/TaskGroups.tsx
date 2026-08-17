import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TaskGroupsContent } from '@/activities/tasks/components/TaskGroupsContent';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useCanUpdateObjectRecords } from '@/object-record/hooks/useCanUpdateObjectRecords';
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

  const { canUpdateObjectRecords } = useCanUpdateObjectRecords(
    targetableObject.targetObjectNameSingular,
  );

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
        onCreateTask={canUpdateObjectRecords ? handleCreateTask : undefined}
        tasks={tasks}
      />
    </>
  );
};
