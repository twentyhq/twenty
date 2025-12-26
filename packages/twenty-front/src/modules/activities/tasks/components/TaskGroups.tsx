import styled from '@emotion/styled';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Task } from '@/activities/types/Task';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import groupBy from 'lodash.groupby';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import { AddTaskButton } from './AddTaskButton';
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
  const { tasks, tasksLoading } = useTasks({
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

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

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
            onClick={() =>
              openCreateActivity({
                targetableObjects: [targetableObject],
              })
            }
          />
        )}
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
              <AddTaskButton activityTargetableObject={targetableObject} />
            )
          }
        />
      ))}
    </StyledContainer>
  );
};
