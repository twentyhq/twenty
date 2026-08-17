import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { TaskList } from '@/activities/tasks/components/TaskList';
import { type Task } from '@/activities/types/Task';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import groupBy from 'lodash.groupby';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

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
  const isTasksEmpty = tasks.length === 0;

  if (isLoading && isTasksEmpty) {
    return <SkeletonLoader />;
  }

  if (isTasksEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="noTask" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`Mission accomplished!`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`All tasks addressed. Maintain the momentum.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {isDefined(onCreateTask) && (
          <Button
            Icon={IconPlus}
            title={t`New task`}
            variant="secondary"
            onClick={onCreateTask}
          />
        )}
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  const sortedTasksByStatus = Object.entries(
    groupBy(tasks, ({ status }) => status),
  ).sort(([statusA], [statusB]) => statusB.localeCompare(statusA));

  return (
    <StyledContainer>
      {sortedTasksByStatus.map(([status, tasksByStatus]: [string, Task[]]) => (
        <TaskList key={status} title={status} tasks={tasksByStatus} />
      ))}
    </StyledContainer>
  );
};
