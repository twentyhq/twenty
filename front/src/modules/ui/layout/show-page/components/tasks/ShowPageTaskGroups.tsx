import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCheckbox } from '@tabler/icons-react';

import { TaskList } from '@/activities/components/TaskList';
import { useEntityTasks } from '@/activities/hooks/useEntityTasks';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { Button, ButtonVariant } from '@/ui/button/components/Button';
import { ActivityType } from '~/generated/graphql';

import { ShowPageTaskGroupAddTaskButton } from './ShowPageTaskGroupAddTaskButton';

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

export function ShowPageTaskGroups({
  entity,
}: {
  entity: ActivityTargetableEntity;
}) {
  const { todayOrPreviousTasks, upcomingTasks, unscheduledTasks } =
    useEntityTasks(entity);
  const theme = useTheme();

  const openCreateActivity = useOpenCreateActivityDrawer();

  if (
    todayOrPreviousTasks?.length === 0 &&
    upcomingTasks?.length === 0 &&
    unscheduledTasks?.length === 0
  ) {
    return (
      <StyledTaskGroupEmptyContainer>
        <StyledEmptyTaskGroupTitle>No task yet</StyledEmptyTaskGroupTitle>
        <StyledEmptyTaskGroupSubTitle>Create one:</StyledEmptyTaskGroupSubTitle>
        <Button
          icon={<IconCheckbox size={theme.icon.size.sm} />}
          title="New task"
          variant={ButtonVariant.Secondary}
          onClick={() => openCreateActivity(ActivityType.Task, [entity])}
        />
      </StyledTaskGroupEmptyContainer>
    );
  }

  return (
    <StyledContainer>
      <TaskList
        title="Today"
        tasks={todayOrPreviousTasks ?? []}
        button={<ShowPageTaskGroupAddTaskButton entity={entity} />}
      />
      <TaskList
        title="Upcoming"
        tasks={upcomingTasks ?? []}
        button={
          !todayOrPreviousTasks?.length && (
            <ShowPageTaskGroupAddTaskButton entity={entity} />
          )
        }
      />
      <TaskList
        title="Unscheduled"
        tasks={unscheduledTasks ?? []}
        button={
          !todayOrPreviousTasks?.length &&
          !upcomingTasks?.length && (
            <ShowPageTaskGroupAddTaskButton entity={entity} />
          )
        }
      />
    </StyledContainer>
  );
}
