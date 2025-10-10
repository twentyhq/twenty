import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVersionVisualizer } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizer';
import { WorkflowVersionVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Suspense } from 'react';
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

export const WorkflowVersionCard = () => {
  const targetRecord = useTargetRecord();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: targetRecord.id,
        }),
      }}
    >
      <WorkflowVersionVisualizerEffect workflowVersionId={targetRecord.id} />
      <Suspense fallback={<LoadingSkeleton />}>
        <WorkflowVersionVisualizer workflowVersionId={targetRecord.id} />
      </Suspense>
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
