import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { WorkflowDiagramEdgeV2EmptyContent } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2EmptyContent';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';

type WorkflowDiagramEdgeV2EmptyProps = {
  labelX: number;
  labelY: number;
  parentStepId: string;
  nextStepId: string;
};

export const WorkflowDiagramEdgeV2Empty = ({
  labelX,
  labelY,
  parentStepId,
  nextStepId,
}: WorkflowDiagramEdgeV2EmptyProps) => {
  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  assertWorkflowWithCurrentVersionIsDefined(workflow);

  const { createStep } = useCreateStep({ workflow });
  const { startNodeCreation } = useStartNodeCreation();

  return (
    <WorkflowDiagramEdgeV2EmptyContent
      labelX={labelX}
      labelY={labelY}
      parentStepId={parentStepId}
      nextStepId={nextStepId}
      onCreateFilter={() => {
        return createStep({
          newStepType: 'FILTER',
          parentStepId,
          nextStepId,
        });
      }}
      onCreateNode={() => {
        startNodeCreation({ parentStepId, nextStepId });
      }}
    />
  );
};
