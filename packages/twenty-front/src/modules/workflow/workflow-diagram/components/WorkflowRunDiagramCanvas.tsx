import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdgeRun';
import { WorkflowDiagramFilterEdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilterEdgeRun';
import { WorkflowDiagramFilteringDisabledEdgeRun } from '@/workflow/workflow-diagram/components/WorkflowDiagramFilteringDisabledEdgeRun';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowRunDiagramCanvasEffect } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvasEffect';
import { useHandleWorkflowRunDiagramCanvasInit } from '@/workflow/workflow-diagram/hooks/useHandleWorkflowRunDiagramCanvasInit';
import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowRunDiagramCanvas = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}) => {
  const tagProps = getWorkflowRunStatusTagProps({
    workflowRunStatus,
  });

  const { handleWorkflowRunDiagramCanvasInit } =
    useHandleWorkflowRunDiagramCanvasInit();

  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeReadonly,
        }}
        edgeTypes={{
          'filtering-disabled--run': WorkflowDiagramFilteringDisabledEdgeRun,
          'empty-filter--run': WorkflowDiagramDefaultEdgeRun,
          'filter--run': WorkflowDiagramFilterEdgeRun,
        }}
        tagContainerTestId="workflow-run-status"
        tagColor={tagProps.color}
        tagText={tagProps.text}
        onInit={handleWorkflowRunDiagramCanvasInit}
      />

      <WorkflowRunDiagramCanvasEffect />
    </ReactFlowProvider>
  );
};
