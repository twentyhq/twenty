import { styled } from '@linaria/react';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Task } from '@/activities/types/Task';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useAICElement } from '@aicorg/sdk-react';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import groupBy from 'lodash.groupby';
import { CoreObjectNameSingular } from 'twenty-shared/types';
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

  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const isLoading =
    (activeTabId !== 'done' && tasksLoading) ||
    (activeTabId === 'done' && tasksLoading);

  const isTasksEmpty =
    (activeTabId !== 'done' && tasks?.length === 0) ||
    (activeTabId === 'done' && tasks?.length === 0);

  const emptyStateTaskAction = useAICElement({
    agentId: `${targetableObject.targetObjectNameSingular}.task.add.empty_state.${targetableObject.id}`,
    agentAction: 'open',
    agentDescription:
      'Open the task creation flow for the current record from the empty-state tasks view.',
    agentEntityId: targetableObject.id,
    agentEntityLabel: `${targetableObject.targetObjectNameSingular} ${targetableObject.id}`,
    agentEntityType: targetableObject.targetObjectNameSingular,
    agentExamples: ['Follow up with Google procurement before proposal review.'],
    agentLabel: `Add task to ${targetableObject.targetObjectNameSingular}`,
    agentRisk: 'medium',
    agentWorkflowStep: `${targetableObject.targetObjectNameSingular}.add_task`,
  });

  if (isLoading && isTasksEmpty) {
    return <SkeletonLoader />;
  }

  if (isTasksEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // oxlint-disable-next-line react/jsx-props-no-spreading
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
          <div {...emptyStateTaskAction.attributes}>
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
          </div>
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
