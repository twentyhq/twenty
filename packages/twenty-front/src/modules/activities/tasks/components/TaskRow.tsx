import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { getActivitySummary } from '@/activities/utils/getActivitySummary';
import { beautifyExactDate, hasDatePassed } from '~/utils/date-utils';

import { ActivityRow } from '@/activities/components/ActivityRow';
import { useActivityTargetsComponentInstanceId } from '@/activities/inline-cell/hooks/useActivityTargetsComponentInstanceId';
import { type Task } from '@/activities/types/Task';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { IconCalendar, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Checkbox, CheckboxShape } from 'twenty-ui/input';
import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';

const StyledTaskBody = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  max-width: calc(80% - ${({ theme }) => theme.spacing(2)});
  text-overflow: ellipsis;
  overflow: hidden;
  padding-bottom: ${({ theme }) => theme.spacing(0.25)};
`;

const StyledTaskTitle = styled.div<{
  completed: boolean;
}>`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(0.25)};
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  align-items: center;
`;

const StyledDueDate = styled.div<{
  isPast: boolean;
}>`
  align-items: center;
  color: ${({ theme, isPast }) =>
    isPast ? theme.font.color.danger : theme.font.color.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
`;

const StyledRightSideContainer = styled.div`
  align-items: center;
  display: inline-flex;
  max-width: 50%;
`;

const StyledActivityTargetsContainer = styled.div`
  overflow: clip;
  width: 100%;
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledLeftSideContainer = styled.div`
  align-items: center;
  display: inline-flex;
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
`;

export const TaskRow = ({ task }: { task: Task }) => {
  const theme = useTheme();
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const body = getActivitySummary(task?.bodyV2?.blocknote ?? null);

  const { completeTask } = useCompleteTask(task);

  const baseComponentInstanceId = `task-row-targets-${task.id}`;
  const componentInstanceId = useActivityTargetsComponentInstanceId(
    baseComponentInstanceId,
  );

  return (
    <ActivityRow
      onClick={() => {
        openRecordInCommandMenu({
          recordId: task.id,
          objectNameSingular: CoreObjectNameSingular.Task,
        });
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
          {task.title || <StyledPlaceholder>{t`Task title`}</StyledPlaceholder>}
        </StyledTaskTitle>
        <StyledTaskBody>
          <OverflowingTextWithTooltip text={body} />
        </StyledTaskBody>
      </StyledLeftSideContainer>
      <StyledRightSideContainer>
        {task.dueAt && (
          <StyledDueDate
            isPast={hasDatePassed(task.dueAt) && task.status === 'TODO'}
          >
            <IconCalendar size={theme.icon.size.md} />
            {beautifyExactDate(task.dueAt)}
          </StyledDueDate>
        )}
        {
          <StyledActivityTargetsContainer>
            <FieldContextProvider
              objectNameSingular={CoreObjectNameSingular.Task}
              objectRecordId={task.id}
              fieldMetadataName="taskTargets"
              fieldPosition={0}
            >
              <RecordFieldsScopeContextProvider
                value={{
                  scopeInstanceId: task.id,
                }}
              >
                <StopPropagationContainer>
                  <ActivityTargetsInlineCell
                    activityObjectNameSingular={CoreObjectNameSingular.Task}
                    activityRecordId={task.id}
                    showLabel={false}
                    maxWidth={200}
                    componentInstanceId={componentInstanceId}
                  />
                </StopPropagationContainer>
              </RecordFieldsScopeContextProvider>
            </FieldContextProvider>
          </StyledActivityTargetsContainer>
        }
      </StyledRightSideContainer>
    </ActivityRow>
  );
};
