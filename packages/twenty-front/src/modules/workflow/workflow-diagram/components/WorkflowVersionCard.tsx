import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVersionVisualizer } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizer';
import { WorkflowVersionVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { styled } from '@linaria/react';
import { Suspense } from 'react';
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
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        borderRadius={themeCssVariables.border.radius.smRound}
        height={SKELETON_HEIGHT_SIZES.m}
      />
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        borderRadius={themeCssVariables.border.radius.smRound}
        height={SKELETON_HEIGHT_SIZES.m}
      />
      <Skeleton
        layout="line"
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.lighter}
        borderRadius={themeCssVariables.border.radius.smRound}
        height={SKELETON_HEIGHT_SIZES.m}
      />
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
