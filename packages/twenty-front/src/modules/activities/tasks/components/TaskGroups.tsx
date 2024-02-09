import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TASKS_TAB_LIST_COMPONENT_ID } from '@/activities/tasks/constants/tasksTabListComponentId';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { IconPlus } from '@/ui/display/icon';
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
  } = useTasks({
    filterDropdownId: filterDropdownId,
    targetableObjects: targetableObjects ?? [],
  });

  const openCreateActivity = useOpenCreateActivityDrawer();

  const { getActiveTabIdState } = useTabList(TASKS_TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(getActiveTabIdState());

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
          <AnimatedPlaceholderEmptyTitle>No Task</AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            There are no tasks for this user filter
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconPlus}
          title="New task"
          variant={'secondary'}
          onClick={() =>
            openCreateActivity({
              type: 'Task',
              targetableObjects,
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
