import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TASKS_TAB_LIST_COMPONENT_ID } from '@/activities/tasks/constants/TasksTabListComponentId';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import groupBy from 'lodash.groupby';
import { AddTaskButton } from './AddTaskButton';
import { TaskList } from './TaskList';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type TaskGroupsProps = {
  filterDropdownId?: string;
  targetableObjects?: ActivityTargetableObject[];
};

export const TaskGroups = ({ targetableObjects }: TaskGroupsProps) => {
  const { tasks, tasksLoading } = useTasks({
    targetableObjects: targetableObjects ?? [],
  });

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const { activeTabIdState } = useTabList(TASKS_TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(activeTabIdState);

  const isLoading =
    (activeTabId !== 'done' && tasksLoading) ||
    (activeTabId === 'done' && tasksLoading);

  const isTasksEmpty =
    (activeTabId !== 'done' && tasks?.length === 0) ||
    (activeTabId === 'done' && tasks?.length === 0);

  if (isLoading && isTasksEmpty) {
    return <SkeletonLoader />;
  }

  if (isTasksEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noTask" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Mission accomplished!
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            All tasks addressed. Maintain the momentum.
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconPlus}
          title="New task"
          variant={'secondary'}
          onClick={() =>
            openCreateActivity({
              targetableObjects: targetableObjects ?? [],
            })
          }
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  const sortedTasksByStatus = Object.entries(
    groupBy(tasks, ({ status }) => status),
  ).sort(([statusA], [statusB]) => statusB.localeCompare(statusA));

  const hasTodoStatus = sortedTasksByStatus.some(
    ([status]) => status === 'TODO',
  );

  return (
    <StyledContainer>
      {sortedTasksByStatus.map(([status, tasksByStatus]: [string, Task[]]) => (
        <TaskList
          key={status}
          title={status}
          tasks={tasksByStatus}
          button={
            (status === 'TODO' || !hasTodoStatus) && (
              <AddTaskButton activityTargetableObjects={targetableObjects} />
            )
          }
        />
      ))}
    </StyledContainer>
  );
};
