import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { ListenRecordUpdatesEffect } from '@/subscription/components/ListenRecordUpdatesEffect';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowRunVisualizer } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizer';
import { WorkflowRunVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizerEffect';
import { WorkflowRunVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowRunVisualizerComponentInstanceContext';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Suspense, useId } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledLoadingSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

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

export const WorkflowRunCard = () => {
  const targetRecord = useTargetRecord();
  const componentId = useId();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: targetRecord.id,
        }),
      }}
    >
      <WorkflowRunVisualizerComponentInstanceContext.Provider
        value={{
          instanceId: componentId,
        }}
      >
        <WorkflowRunVisualizerEffect workflowRunId={targetRecord.id} />
        <ListenRecordUpdatesEffect
          objectNameSingular={targetRecord.targetObjectNameSingular}
          recordId={targetRecord.id}
          listenedFields={['status', 'state']}
        />
        <Suspense fallback={<LoadingSkeleton />}>
          <WorkflowRunVisualizer workflowRunId={targetRecord.id} />
        </Suspense>
      </WorkflowRunVisualizerComponentInstanceContext.Provider>
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
