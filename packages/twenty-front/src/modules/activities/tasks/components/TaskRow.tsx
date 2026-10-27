import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { LinkifiedText } from '@/ui/field/display/components/LinkifiedText/LinkifiedText';
import { beautifyExactDate, hasDatePassed } from '~/utils/date-utils';

import { ActivityRow } from '@/activities/components/ActivityRow';
import { useActivityFieldComponentInstanceId } from '@/activities/hooks/useActivityFieldComponentInstanceId';
import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { type Task } from '@/activities/types/Task';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { useObjectMorphJunctionConfigOrThrow } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfigOrThrow';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { getRichTextFieldTextLines } from '@/object-record/record-field/ui/utils/getRichTextFieldTextLines';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconCalendar } from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledTaskBody = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  max-width: calc(80% - ${themeCssVariables.spacing[2]});
  overflow: hidden;
  padding-bottom: 1px;
  text-overflow: ellipsis;
`;

const StyledTaskTitle = styled.div<{
  completed: boolean;
}>`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  padding-bottom: 1px;
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  text-overflow: ellipsis;

  white-space: nowrap;
`;

const StyledDueDate = styled.div<{
  isPast: boolean;
}>`
  align-items: center;
  color: ${({ isPast }) =>
    isPast
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
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
  color: ${themeCssVariables.font.color.light};
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

export const TaskRow = ({
  task,
  divider = false,
}: {
  task: Task;
  divider?: boolean;
}) => {
  const theme = useTheme();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const body = getRichTextFieldTextLines(task?.bodyV2)[0] ?? '';

  const { completeTask } = useCompleteTask(task);

  const junctionFieldName = useObjectMorphJunctionConfigOrThrow({
    objectNameSingular: CoreObjectNameSingular.Task,
  }).junctionField.name;

  const instanceIdPrefix =
    useActivityFieldComponentInstanceId('task-row-targets');
  const componentInstanceId = getRecordFieldInputInstanceId({
    recordId: task.id,
    fieldName: junctionFieldName,
    prefix: instanceIdPrefix,
  });

  return (
    <ActivityRow
      divider={divider}
      label={isNonEmptyString(task.title) ? task.title : t`Task title`}
      onClick={() => {
        openRecordInSidePanel({
          recordId: task.id,
          objectNameSingular: CoreObjectNameSingular.Task,
        });
      }}
    >
      <StyledLeftSideContainer>
        <Card.Control
          render={<StyledCheckboxContainer />}
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={task.status === 'DONE'}
            shape={'round'}
            onCheckedChange={completeTask}
          />
        </Card.Control>
        <StyledTaskTitle completed={task.status === 'DONE'}>
          {task.title || <StyledPlaceholder>{t`Task title`}</StyledPlaceholder>}
        </StyledTaskTitle>
        <Card.Control render={<StyledTaskBody />}>
          <OverflowingTextWithTooltip
            text={<LinkifiedText text={body} />}
            tooltipContent={body}
          />
        </Card.Control>
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
          <Card.Control render={<StyledActivityTargetsContainer />}>
            <FieldContextProvider
              objectNameSingular={CoreObjectNameSingular.Task}
              objectRecordId={task.id}
              fieldMetadataName={junctionFieldName}
              fieldPosition={0}
              showLabel={false}
              maxWidth={200}
              isDisplayModeFixHeight
            >
              <StopPropagationContainer>
                <RecordFieldComponentInstanceContext.Provider
                  value={{ instanceId: componentInstanceId }}
                >
                  <RecordInlineCell instanceIdPrefix={instanceIdPrefix} />
                </RecordFieldComponentInstanceContext.Provider>
              </StopPropagationContainer>
            </FieldContextProvider>
          </Card.Control>
        }
      </StyledRightSideContainer>
    </ActivityRow>
  );
};
