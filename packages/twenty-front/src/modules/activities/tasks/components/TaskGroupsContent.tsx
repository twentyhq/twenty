import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { TaskList } from '@/activities/tasks/components/TaskList';
import { type Task } from '@/activities/types/Task';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import groupBy from 'lodash.groupby';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type TaskGroupsContentProps = {
  isLoading: boolean;
  onCreateTask: (() => void) | undefined;
  tasks: Task[];
};

export const TaskGroupsContent = ({
  isLoading,
  onCreateTask,
  tasks,
}: TaskGroupsContentProps) => {
  const { objectMetadataItem: taskObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
  });

  const taskStatusOptions = taskObjectMetadataItem.fields.find(
    (field) => field.name === 'status',
  )?.options;

  const isTasksEmpty = tasks.length === 0;

  if (isLoading && isTasksEmpty) {
    return <SkeletonLoader />;
  }

  if (isTasksEmpty) {
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder type="noTask" />
        <EmptyState.Content>
          <EmptyState.Title>{t`Mission accomplished!`}</EmptyState.Title>
          <EmptyState.Description>
            {t`All tasks addressed. Maintain the momentum.`}
          </EmptyState.Description>
        </EmptyState.Content>
        {isDefined(onCreateTask) && (
          <Button
            startIcon={<IconPlus />}
            onClick={onCreateTask}
            variant="outline"
          >{t`New task`}</Button>
        )}
      </EmptyState.Root>
    );
  }

  const sortedTasksByStatus = Object.entries(
    groupBy(tasks, ({ status }) => status),
  ).sort(([statusA], [statusB]) => statusB.localeCompare(statusA));

  return (
    <StyledContainer>
      {sortedTasksByStatus.map(
        ([status, tasksByStatus]: [string, Task[]], index) => {
          const statusOption = taskStatusOptions?.find(
            (option) => option.value === status,
          );

          return (
            <TaskList
              key={status}
              title={statusOption?.label ?? status}
              titleColor={statusOption?.color ?? 'transparent'}
              tasks={tasksByStatus}
              isFirst={index === 0}
            />
          );
        },
      )}
    </StyledContainer>
  );
};
