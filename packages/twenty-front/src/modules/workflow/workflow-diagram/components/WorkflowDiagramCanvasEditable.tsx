import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditable';
import { WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowDiagramCanvasEditable = ({
  diagram,
  workflowWithCurrentVersion,
}: {
  diagram: WorkflowDiagram;
  workflowWithCurrentVersion: WorkflowWithCurrentVersion;
}) => {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        diagram={diagram}
        status={workflowWithCurrentVersion.currentVersion.status}
        nodeTypes={{
          default: WorkflowDiagramStepNodeEditable,
          'create-step': WorkflowDiagramCreateStepNode,
          'empty-trigger': WorkflowDiagramEmptyTrigger,
        }}
      >
        <WorkflowDiagramCanvasEditableEffect />
      </WorkflowDiagramCanvasBase>
    </ReactFlowProvider>
  );
};
