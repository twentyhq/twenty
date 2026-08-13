import { styled } from '@linaria/react';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Task } from '@/activities/types/Task';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetHeaderInfoEffect } from '@/page-layout/widgets/components/WidgetHeaderInfoEffect';
import { type WidgetHeaderAction } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import groupBy from 'lodash.groupby';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';
import { TaskList } from './TaskList';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type TaskGroupsProps = {
  filterDropdownId?: string;
  targetableObject: ActivityTargetableObject;
};

export const TaskGroups = ({ targetableObject }: TaskGroupsProps) => {
  const { tasks, tasksLoading, totalCountTasks } = useTasks({
    targetableObjects: [targetableObject],
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const handleNewTaskClick = () => {
    openCreateActivity({ targetableObjects: [targetableObject] });
  };

  const newTaskAction: WidgetHeaderAction = {
    actionType: 'button',
    Icon: IconPlus,
    label: t`New task`,
    onClick: handleNewTaskClick,
  };

  const widgetHeaderInfoEffect = (
    <WidgetHeaderInfoEffect
      count={totalCountTasks}
      actions={hasObjectUpdatePermissions ? [newTaskAction] : undefined}
    />
  );

  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const isLoading =
    (activeTabId !== 'done' && tasksLoading) ||
    (activeTabId === 'done' && tasksLoading);

  const isTasksEmpty =
    (activeTabId !== 'done' && tasks?.length === 0) ||
    (activeTabId === 'done' && tasks?.length === 0);

  if (isLoading && isTasksEmpty) {
    return (
      <>
        {widgetHeaderInfoEffect}
        <SkeletonLoader />
      </>
    );
  }

  if (isTasksEmpty) {
    return (
      <>
        {widgetHeaderInfoEffect}
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
          {hasObjectUpdatePermissions && (
            <Button
              Icon={IconPlus}
              title={t`New task`}
              variant="secondary"
              onClick={handleNewTaskClick}
            />
          )}
        </AnimatedPlaceholderEmptyContainer>
      </>
    );
  }

  const sortedTasksByStatus = Object.entries(
    groupBy(tasks, ({ status }) => status),
  ).sort(([statusA], [statusB]) => statusB.localeCompare(statusA));

  return (
    <>
      {widgetHeaderInfoEffect}
      <StyledContainer>
        {sortedTasksByStatus.map(
          ([status, tasksByStatus]: [string, Task[]]) => (
            <TaskList key={status} title={status} tasks={tasksByStatus} />
          ),
        )}
      </StyledContainer>
    </>
  );
};
