import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TASKS_TAB_LIST_COMPONENT_ID } from '@/activities/tasks/constants/tasksTabListComponentId';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';

import { AddTaskButton } from './AddTaskButton';
import { TaskList } from './TaskList';

const StyledTaskGroupEmptyContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding-bottom: ${({ theme }) => theme.spacing(16)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledEmptyTaskGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
`;

const StyledEmptyTaskGroupSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

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

  const { activeTabIdState } = useTabList(TASKS_TAB_LIST_COMPONENT_ID);
  const activeTabId = useRecoilValue(activeTabIdState);

  if (
    (activeTabId !== 'done' &&
      todayOrPreviousTasks?.length === 0 &&
      upcomingTasks?.length === 0 &&
      unscheduledTasks?.length === 0) ||
    (activeTabId === 'done' && completedTasks?.length === 0)
  ) {
    return (
      <StyledTaskGroupEmptyContainer>
        <StyledEmptyTaskGroupTitle>No task yet</StyledEmptyTaskGroupTitle>
        <StyledEmptyTaskGroupSubTitle>Create one:</StyledEmptyTaskGroupSubTitle>
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
      </StyledTaskGroupEmptyContainer>
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
