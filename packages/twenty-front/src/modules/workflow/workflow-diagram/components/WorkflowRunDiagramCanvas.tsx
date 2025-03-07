import { WorkflowRunStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramStatusTagContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramStatusTagContainer';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramSuccessEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramSuccessEdge';
import { WorkflowRunDiagramCanvasEffect } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramCanvasEffect';
import { WorkflowRunStatusTag } from '@/workflow/workflow-diagram/components/WorkflowRunStatusTag';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowRunDiagramCanvas = ({
  workflowRunStatus,
}: {
  workflowRunStatus: WorkflowRunStatus;
}) => {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeReadonly,
        }}
        edgeTypes={{
          default: WorkflowDiagramDefaultEdge,
          success: WorkflowDiagramSuccessEdge,
        }}
        Tag={
          <WorkflowDiagramStatusTagContainer data-testid="workflow-run-status">
            <WorkflowRunStatusTag workflowRunStatus={workflowRunStatus} />
          </WorkflowDiagramStatusTagContainer>
        }
      />

      <WorkflowRunDiagramCanvasEffect />
    </ReactFlowProvider>
  );
};
