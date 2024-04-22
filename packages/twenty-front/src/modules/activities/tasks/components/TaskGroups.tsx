import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui';

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
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

import { AddTaskButton } from './AddTaskButton';
import { TaskList } from './TaskList';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type TaskGroupsProps = {
  filterDropdownId?: string;
  targetableObjects?: ActivityTargetableObject[];
  showAddButton?: boolean;
};

export const TaskGroups = ({
  filterDropdownId,
  targetableObjects,
  showAddButton,
}: TaskGroupsProps) => {
  const {
    todayOrPreviousTasks,
    upcomingTasks,
    unscheduledTasks,
    completedTasks,
    initialized,
  } = useTasks({
    filterDropdownId: filterDropdownId,
    targetableObjects: targetableObjects ?? [],
  });

  const openCreateActivity = useOpenCreateActivityDrawer();

  const { activeTabIdState } = useTabList(TASKS_TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(activeTabIdState);

  if (!initialized) {
    return <></>;
  }

  if (
    (activeTabId !== 'done' &&
      todayOrPreviousTasks?.length === 0 &&
      upcomingTasks?.length === 0 &&
      unscheduledTasks?.length === 0) ||
    (activeTabId === 'done' && completedTasks?.length === 0)
  ) {
    return (
      <AnimatedPlaceholderEmptyContainer>
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
              type: 'Task',
              targetableObjects: targetableObjects ?? [],
            })
          }
        />
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledContainer>
      {activeTabId === 'done' ? (
        <TaskList
          tasks={completedTasks ?? []}
          button={
            showAddButton && (
              <AddTaskButton activityTargetableObjects={targetableObjects} />
            )
          }
        />
      ) : (
        <>
          <TaskList
            title="Today"
            tasks={todayOrPreviousTasks ?? []}
            button={
              showAddButton && (
                <AddTaskButton activityTargetableObjects={targetableObjects} />
              )
            }
          />
          <TaskList
            title="Upcoming"
            tasks={upcomingTasks ?? []}
            button={
              showAddButton &&
              !todayOrPreviousTasks?.length && (
                <AddTaskButton activityTargetableObjects={targetableObjects} />
              )
            }
          />
          <TaskList
            title="Unscheduled"
            tasks={unscheduledTasks ?? []}
            button={
              showAddButton &&
              !todayOrPreviousTasks?.length &&
              !upcomingTasks?.length && (
                <AddTaskButton activityTargetableObjects={targetableObjects} />
              )
            }
          />
        </>
      )}
    </StyledContainer>
  );
};
