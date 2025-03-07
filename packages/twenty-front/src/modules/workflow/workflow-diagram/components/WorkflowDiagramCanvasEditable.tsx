import { WorkflowVersionStatus } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramDefaultEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramDefaultEdge';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStatusTagContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramStatusTagContainer';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditable';
import { WorkflowVersionStatusTag } from '@/workflow/workflow-diagram/components/WorkflowVersionStatusTag';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowDiagramCanvasEditable = ({
  versionStatus,
}: {
  versionStatus: WorkflowVersionStatus;
}) => {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        nodeTypes={{
          default: WorkflowDiagramStepNodeEditable,
          'create-step': WorkflowDiagramCreateStepNode,
          'empty-trigger': WorkflowDiagramEmptyTrigger,
        }}
        edgeTypes={{
          default: WorkflowDiagramDefaultEdge,
        }}
        Tag={
          <WorkflowDiagramStatusTagContainer data-testid="workflow-visualizer-status">
            <WorkflowVersionStatusTag versionStatus={versionStatus} />
          </WorkflowDiagramStatusTagContainer>
        }
      />
      <WorkflowDiagramCanvasEditableEffect />
    </ReactFlowProvider>
  );
};
