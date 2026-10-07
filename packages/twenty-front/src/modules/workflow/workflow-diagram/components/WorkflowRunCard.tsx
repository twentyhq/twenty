import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowRunSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowRunSSESubscribeEffect';
import { WorkflowRunVisualizer } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizer';
import { WorkflowRunVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowRunVisualizerEffect';
import { WorkflowRunVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowRunVisualizerComponentInstanceContext';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { styled } from '@linaria/react';
import { Suspense, useId } from 'react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';
const StyledLoadingSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const LoadingSkeleton = () => {
  return (
    <StyledLoadingSkeletonContainer>
      <Skeleton height={SKELETON_HEIGHT_SIZES.m} />
      <Skeleton height={SKELETON_HEIGHT_SIZES.m} />
      <Skeleton height={SKELETON_HEIGHT_SIZES.m} />
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
