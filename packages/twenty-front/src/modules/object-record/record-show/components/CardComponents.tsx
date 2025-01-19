import { Calendar } from '@/activities/calendar/components/Calendar';
import { EmailThreads } from '@/activities/emails/components/EmailThreads';
import { Attachments } from '@/activities/files/components/Attachments';
import { Notes } from '@/activities/notes/components/Notes';
import { ObjectTasks } from '@/activities/tasks/components/ObjectTasks';
import { TimelineActivities } from '@/activities/timeline-activities/components/TimelineActivities';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { FieldsCard } from '@/object-record/record-show/components/FieldsCard';
import { CardType } from '@/object-record/record-show/types/CardType';
import { ShowPageActivityContainer } from '@/ui/layout/show-page/components/ShowPageActivityContainer';
import { WorkflowRunOutputVisualizer } from '@/workflow/components/WorkflowRunOutputVisualizer';
import { WorkflowRunVersionVisualizer } from '@/workflow/components/WorkflowRunVersionVisualizer';
import { WorkflowVersionVisualizer } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizer';
import { WorkflowVersionVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizerEffect';
import { WorkflowVisualizer } from '@/workflow/workflow-diagram/components/WorkflowVisualizer';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import styled from '@emotion/styled';

const StyledGreyBox = styled.div<{ isInRightDrawer?: boolean }>`
  background: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.background.secondary : ''};
  border: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? `1px solid ${theme.border.color.medium}` : ''};
  border-radius: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.border.radius.md : ''};
  height: ${({ isInRightDrawer }) => (isInRightDrawer ? 'auto' : '100%')};

  margin: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.spacing(4) : ''};
`;

type CardComponentProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isInRightDrawer?: boolean;
};

type CardComponentType = (props: CardComponentProps) => JSX.Element | null;

export const CardComponents: Record<CardType, CardComponentType> = {
  [CardType.TimelineCard]: ({ targetableObject }) => (
    <TimelineActivities targetableObject={targetableObject} />
  ),

  [CardType.FieldCard]: ({ targetableObject, isInRightDrawer }) => (
    <StyledGreyBox isInRightDrawer={isInRightDrawer}>
      <FieldsCard
        objectNameSingular={targetableObject.targetObjectNameSingular}
        objectRecordId={targetableObject.id}
      />
    </StyledGreyBox>
  ),

  [CardType.RichTextCard]: ({ targetableObject }) => (
    <ShowPageActivityContainer targetableObject={targetableObject} />
  ),

  [CardType.TaskCard]: ({ targetableObject }) => (
    <ObjectTasks targetableObject={targetableObject} />
  ),

  [CardType.NoteCard]: ({ targetableObject }) => (
    <Notes targetableObject={targetableObject} />
  ),

  [CardType.FileCard]: ({ targetableObject }) => (
    <Attachments targetableObject={targetableObject} />
  ),

  [CardType.EmailCard]: ({ targetableObject }) => (
    <EmailThreads targetableObject={targetableObject} />
  ),

  [CardType.CalendarCard]: ({ targetableObject }) => (
    <Calendar targetableObject={targetableObject} />
  ),

  [CardType.WorkflowCard]: ({ targetableObject }) => (
    <>
      <WorkflowVisualizerEffect workflowId={targetableObject.id} />
      <WorkflowVisualizer targetableObject={targetableObject} />
    </>
  ),

  [CardType.WorkflowVersionCard]: ({ targetableObject }) => (
    <>
      <WorkflowVersionVisualizerEffect
        workflowVersionId={targetableObject.id}
      />
      <WorkflowVersionVisualizer workflowVersionId={targetableObject.id} />
    </>
  ),

  [CardType.WorkflowRunCard]: ({ targetableObject }) => (
    <WorkflowRunVersionVisualizer workflowRunId={targetableObject.id} />
  ),

  [CardType.WorkflowRunOutputCard]: ({ targetableObject }) => (
    <WorkflowRunOutputVisualizer workflowRunId={targetableObject.id} />
  ),
};
