import { Calendar } from '@/activities/calendar/components/Calendar';
import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { EmailThreads } from '@/activities/emails/components/EmailThreads';
import { Attachments } from '@/activities/files/components/Attachments';
import { Notes } from '@/activities/notes/components/Notes';
import { ObjectTasks } from '@/activities/tasks/components/ObjectTasks';
import { TimelineActivities } from '@/activities/timeline-activities/components/TimelineActivities';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { FieldsCard } from '@/object-record/record-show/components/FieldsCard';
import { CardType } from '@/object-record/record-show/types/CardType';
import { ListenRecordUpdatesEffect } from '@/subscription/components/ListenRecordUpdatesEffect';
import { ShowPageActivityContainer } from '@/ui/layout/show-page/components/ShowPageActivityContainer';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowRunVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizerEffect';
import { WorkflowVersionVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizerEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowRunVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowRunVisualizerComponentInstanceContext';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { lazy, Suspense, useId } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

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

const StyledLoadingSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

type CardComponentProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  isInRightDrawer?: boolean;
};

type CardComponentType = (
  props: CardComponentProps | FieldsCardComponentProps,
) => JSX.Element | null;

type FieldsCardComponentProps = CardComponentProps & {
  showDuplicatesSection?: boolean;
};

const LoadingSkeleton = () => {
  const theme = useTheme();

  return (
    <StyledLoadingSkeletonContainer>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={theme.border.radius.sm}
      >
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} />
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} />
        <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} />
      </SkeletonTheme>
    </StyledLoadingSkeletonContainer>
  );
};

const WorkflowVisualizer = lazy(() =>
  import('@/workflow/workflow-diagram/components/WorkflowVisualizer').then(
    (module) => ({
      default: module.WorkflowVisualizer,
    }),
  ),
);

const WorkflowVersionVisualizer = lazy(() =>
  import(
    '@/workflow/workflow-diagram/components/WorkflowVersionVisualizer'
  ).then((module) => ({
    default: module.WorkflowVersionVisualizer,
  })),
);

const WorkflowRunVisualizer = lazy(() =>
  import('@/workflow/workflow-diagram/components/WorkflowRunVisualizer').then(
    (module) => ({
      default: module.WorkflowRunVisualizer,
    }),
  ),
);

export const CardComponents: Record<CardType, CardComponentType> = {
  [CardType.TimelineCard]: ({ targetableObject, isInRightDrawer }) => (
    <TimelineActivities
      targetableObject={targetableObject}
      isInRightDrawer={isInRightDrawer}
    />
  ),

  [CardType.FieldCard]: ({
    targetableObject,
    isInRightDrawer,
    showDuplicatesSection,
  }: FieldsCardComponentProps) => (
    <StyledGreyBox isInRightDrawer={isInRightDrawer}>
      <FieldsCard
        objectNameSingular={targetableObject.targetObjectNameSingular}
        objectRecordId={targetableObject.id}
        showDuplicatesSection={showDuplicatesSection}
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

  [CardType.WorkflowCard]: ({ targetableObject }) => {
    return (
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: getWorkflowVisualizerComponentInstanceId({
            recordId: targetableObject.id,
          }),
        }}
      >
        <WorkflowVisualizerEffect workflowId={targetableObject.id} />
        <Suspense fallback={<LoadingSkeleton />}>
          <WorkflowVisualizer workflowId={targetableObject.id} />
        </Suspense>
      </WorkflowVisualizerComponentInstanceContext.Provider>
    );
  },

  [CardType.WorkflowVersionCard]: ({ targetableObject }) => {
    return (
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: getWorkflowVisualizerComponentInstanceId({
            recordId: targetableObject.id,
          }),
        }}
      >
        <WorkflowVersionVisualizerEffect
          workflowVersionId={targetableObject.id}
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <WorkflowVersionVisualizer workflowVersionId={targetableObject.id} />
        </Suspense>
      </WorkflowVisualizerComponentInstanceContext.Provider>
    );
  },

  [CardType.WorkflowRunCard]: ({ targetableObject }) => {
    const componentId = useId();

    return (
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: getWorkflowVisualizerComponentInstanceId({
            recordId: targetableObject.id,
          }),
        }}
      >
        <WorkflowRunVisualizerComponentInstanceContext.Provider
          value={{
            instanceId: componentId,
          }}
        >
          <WorkflowRunVisualizerEffect workflowRunId={targetableObject.id} />
          <ListenRecordUpdatesEffect
            objectNameSingular={targetableObject.targetObjectNameSingular}
            recordId={targetableObject.id}
            listenedFields={['status', 'state']}
          />
          <Suspense fallback={<LoadingSkeleton />}>
            <WorkflowRunVisualizer workflowRunId={targetableObject.id} />
          </Suspense>
        </WorkflowRunVisualizerComponentInstanceContext.Provider>
      </WorkflowVisualizerComponentInstanceContext.Provider>
    );
  },
};
