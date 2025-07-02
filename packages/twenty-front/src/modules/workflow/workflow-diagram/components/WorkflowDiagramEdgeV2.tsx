import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { WorkflowDiagramEdgeV2Content } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Content';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { isDefined } from 'twenty-shared/utils';

type WorkflowDiagramEdgeV2Props = {
  labelX: number;
  labelY: number;
  stepId: string | undefined;
  parentStepId: string;
  nextStepId: string;
  filter: Record<string, any> | undefined;
};

export const WorkflowDiagramEdgeV2 = ({
  labelX,
  labelY,
  stepId,
  parentStepId,
  nextStepId,
  filter,
}: WorkflowDiagramEdgeV2Props) => {
  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  assertWorkflowWithCurrentVersionIsDefined(workflow);

  const { createStep } = useCreateStep({ workflow });
  const { deleteStep } = useDeleteStep({ workflow });
  const { startNodeCreation } = useStartNodeCreation();

  return (
    <WorkflowDiagramEdgeV2Content
      labelX={labelX}
      labelY={labelY}
      stepId={stepId}
      parentStepId={parentStepId}
      nextStepId={nextStepId}
      filter={filter}
      onCreateFilter={() => {
        return createStep({
          newStepType: 'FILTER',
          parentStepId,
          nextStepId,
        });
      }}
      onDeleteFilter={() => {
        if (!isDefined(stepId)) {
          throw new Error(
            'Step ID must be configured for the edge when rendering a filter',
          );
        }

        return deleteStep(stepId);
      }}
      onCreateNode={() => {
        if (isDefined(filter)) {
          startNodeCreation({ parentStepId: stepId, nextStepId });
        } else {
          startNodeCreation({ parentStepId, nextStepId });
        }
      }}
    />
  );
};
