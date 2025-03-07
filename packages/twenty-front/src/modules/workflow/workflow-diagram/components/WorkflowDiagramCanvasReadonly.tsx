import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStatusTagContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramStatusTagContainer';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowDiagramSuccessEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramSuccessEdge';
import { WorkflowVersionStatusTag } from '@/workflow/workflow-diagram/components/WorkflowVersionStatusTag';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowDiagramCanvasReadonly = ({
  versionStatus,
}: {
  versionStatus: WorkflowVersionStatus;
}) => {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeReadonly,
          'empty-trigger': WorkflowDiagramEmptyTrigger,
        }}
        edgeTypes={{
          default: WorkflowDiagramDefaultEdge,
          success: WorkflowDiagramSuccessEdge,
        }}
        Tag={
          <WorkflowDiagramStatusTagContainer data-testid="workflow-visualizer-status">
            <WorkflowVersionStatusTag versionStatus={versionStatus} />
          </WorkflowDiagramStatusTagContainer>
        }
      />
      <WorkflowDiagramCanvasReadonlyEffect />
    </ReactFlowProvider>
  );
};
