import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCalendar, OverflowingTextWithTooltip } from 'twenty-ui';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { getActivitySummary } from '@/activities/utils/getActivitySummary';
import { Checkbox, CheckboxShape } from '@/ui/input/components/Checkbox';
import { beautifyExactDate, hasDatePassed } from '~/utils/date-utils';

import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { useCompleteTask } from '../hooks/useCompleteTask';

const StyledContainer = styled.div`
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: inline-flex;
  height: ${({ theme }) => theme.spacing(12)};
  min-width: calc(100% - ${({ theme }) => theme.spacing(8)});
  max-width: calc(100% - ${({ theme }) => theme.spacing(8)});
  padding: 0 ${({ theme }) => theme.spacing(4)};
  overflow: hidden;

  &:last-child {
    border-bottom: 0;
  }
`;

const StyledTaskBody = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  max-width: 100%;
  flex: 1;
  overflow: hidden;
`;

const StyledTaskTitle = styled.div<{
  completed: boolean;
}>`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  white-space: nowrap;
`;

const StyledRightSideContainer = styled.div`
  display: flex;
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledLeftSideContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
`;

export const TaskRow = ({ task }: { task: Task }) => {
  const theme = useTheme();
  const openActivityRightDrawer = useOpenActivityRightDrawer({
    objectNameSingular: CoreObjectNameSingular.Task,
  });

  const body = getActivitySummary(task.body);
  const { completeTask } = useCompleteTask(task);

  const { FieldContextProvider: TaskTargetsContextProvider } = useFieldContext({
    objectNameSingular: CoreObjectNameSingular.Task,
    objectRecordId: task.id,
    fieldMetadataName: 'taskTargets',
    fieldPosition: 0,
  });

  return (
    <StyledContainer
      onClick={() => {
        openActivityRightDrawer(task.id);
      }}
    >
      <StyledLeftSideContainer>
        <StyledCheckboxContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Checkbox
            checked={task.status === 'DONE'}
            shape={CheckboxShape.Rounded}
            onCheckedChange={completeTask}
          />
        </StyledCheckboxContainer>
        <StyledTaskTitle completed={task.status === 'DONE'}>
          {task.title || <StyledPlaceholder>Task title</StyledPlaceholder>}
        </StyledTaskTitle>
        <StyledTaskBody>
          <OverflowingTextWithTooltip text={body} />
        </StyledTaskBody>
      </StyledLeftSideContainer>
      <StyledRightSideContainer>
        {TaskTargetsContextProvider && (
          <TaskTargetsContextProvider>
            <ActivityTargetsInlineCell
              activityObjectNameSingular={CoreObjectNameSingular.Task}
              activity={task}
              showLabel={false}
              maxWidth={200}
              readonly
            />
          </TaskTargetsContextProvider>
        )}
        <StyledDueDate
          isPast={
            !!task.dueAt && hasDatePassed(task.dueAt) && task.status === 'TODO'
          }
        >
          <IconCalendar size={theme.icon.size.md} />
          {task.dueAt && beautifyExactDate(task.dueAt)}
        </StyledDueDate>
      </StyledRightSideContainer>
    </StyledContainer>
  );
};
