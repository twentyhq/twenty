import styled from '@emotion/styled';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Button,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
  IconPlus,
} from 'twenty-ui';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TASKS_TAB_LIST_COMPONENT_ID } from '@/activities/tasks/constants/TasksTabListComponentId';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import groupBy from 'lodash.groupby';
import { useTranslation } from 'react-i18next';
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
  
  const { t } = useTranslation();

  const { activeTabId } = useTabList(TASKS_TAB_LIST_COMPONENT_ID);

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
            {t('missionAccomplished')}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t('allTasksAddressedDescription')}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconPlus}
          title={t('newTask')}
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
