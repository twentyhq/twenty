import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { getActivitySummary } from '@/activities/utils/getActivitySummary';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { IconCalendar, IconComment } from '@/ui/display/icon';
import { OverflowingTextWithTooltip } from '@/ui/display/tooltip/OverflowingTextWithTooltip';
import { Checkbox, CheckboxShape } from '@/ui/input/components/Checkbox';
import { beautifyExactDate, hasDatePassed } from '~/utils/date-utils';

import { useCompleteTask } from '../hooks/useCompleteTask';

const StyledContainer = styled.div`
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: inline-flex;
  height: ${({ theme }) => theme.spacing(12)};
  min-width: calc(100% - ${({ theme }) => theme.spacing(8)});
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

const StyledTaskBody = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 1px;
`;

const StyledTaskTitle = styled.div<{
  completed: boolean;
}>`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
`;

const StyledCommentIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledDueDate = styled.div<{
  isPast: boolean;
}>`
  align-items: center;
  color: ${({ theme, isPast }) =>
    isPast ? theme.font.color.danger : theme.font.color.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledFieldsContainer = styled.div`
  display: flex;
`;

export const TaskRow = ({
  task,
}: {
  task: Omit<GraphQLActivity, 'assigneeId'>;
}) => {
  const theme = useTheme();
  const openActivityRightDrawer = useOpenActivityRightDrawer();

  const body = getActivitySummary(task.body);
  const { completeTask } = useCompleteTask(task);

  const activityTargetIds =
    task?.activityTargets?.edges?.map(
      (activityTarget) => activityTarget.node.id,
    ) ?? [];

  const { records: activityTargets } = useFindManyRecords<ActivityTarget>({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    filter: { id: { in: activityTargetIds } },
  });

  return (
    <StyledContainer
      onClick={() => {
        openActivityRightDrawer(task.id);
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Checkbox
          checked={!!task.completedAt}
          shape={CheckboxShape.Rounded}
          onCheckedChange={completeTask}
        />
      </div>
      <StyledTaskTitle completed={task.completedAt !== null}>
        {task.title ?? 'Task Title'}
      </StyledTaskTitle>
      <StyledTaskBody>
        <OverflowingTextWithTooltip text={body} />
        {task.comments && task.comments.length > 0 && (
          <StyledCommentIcon>
            <IconComment size={theme.icon.size.md} />
          </StyledCommentIcon>
        )}
      </StyledTaskBody>
      <StyledFieldsContainer>
        <ActivityTargetChips targets={activityTargets} />
        <StyledDueDate
          isPast={
            !!task.dueAt && hasDatePassed(task.dueAt) && !task.completedAt
          }
        >
          <IconCalendar size={theme.icon.size.md} />
          {task.dueAt && beautifyExactDate(task.dueAt)}
        </StyledDueDate>
      </StyledFieldsContainer>
    </StyledContainer>
  );
};
