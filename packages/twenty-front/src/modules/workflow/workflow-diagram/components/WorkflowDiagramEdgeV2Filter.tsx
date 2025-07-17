import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramEdgeV2FilterContent } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2FilterContent';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { FilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';
import { isDefined } from 'twenty-shared/utils';

type WorkflowDiagramEdgeV2FilterProps = {
  labelX: number;
  labelY: number;
  stepId: string;
  parentStepId: string;
  nextStepId: string;
  filterSettings: FilterSettings;
  isEdgeEditable: boolean;
};

export const WorkflowDiagramEdgeV2Filter = ({
  labelX,
  labelY,
  stepId,
  parentStepId,
  nextStepId,
  filterSettings,
  isEdgeEditable,
}: WorkflowDiagramEdgeV2FilterProps) => {
  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const { deleteStep } = useDeleteStep({ workflow });
  const { startNodeCreation } = useStartNodeCreation();

  return (
    <WorkflowDiagramEdgeV2FilterContent
      labelX={labelX}
      labelY={labelY}
      stepId={stepId}
      parentStepId={parentStepId}
      nextStepId={nextStepId}
      filterSettings={filterSettings}
      isEdgeEditable={isEdgeEditable}
      onDeleteFilter={() => {
        if (!isDefined(stepId)) {
          throw new Error(
            'Step ID must be configured for the edge when rendering a filter',
          );
        }

        return deleteStep(stepId);
      }}
      onCreateNode={() => {
        startNodeCreation({ parentStepId: stepId, nextStepId });
      }}
    />
  );
};
