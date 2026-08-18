import { useCreateActivityForTargetRecord } from '@/activities/hooks/useCreateActivityForTargetRecord';
import { TaskGroupsContent } from '@/activities/tasks/components/TaskGroupsContent';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
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

  const { canCreateActivity, createActivity } =
    useCreateActivityForTargetRecord({
      targetRecord: targetableObject,
      activityObjectNameSingular: CoreObjectNameSingular.Task,
    });

  return (
    <>
      <WidgetHeaderCountEffect count={totalCountTasks} />
      <TaskGroupsContent
        isLoading={tasksLoading}
        onCreateTask={canCreateActivity ? createActivity : undefined}
        tasks={tasks}
      />
    </>
  );
};
