import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowRunSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowRunSSESubscribeEffect';
import { WorkflowRunVisualizer } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizer';
import { WorkflowRunVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizerEffect';
import { WorkflowRunVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowRunVisualizerComponentInstanceContext';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { styled } from '@linaria/react';
import { Suspense, useContext, useId } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
const StyledLoadingSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const LoadingSkeleton = () => {
  const { theme } = useContext(ThemeContext);
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
        <WorkflowRunSSESubscribeEffect workflowRunId={targetRecord.id} />
        <Suspense fallback={<LoadingSkeleton />}>
          <WorkflowRunVisualizer workflowRunId={targetRecord.id} />
        </Suspense>
      </WorkflowRunVisualizerComponentInstanceContext.Provider>
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
