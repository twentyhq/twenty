import { WorkflowDiagramCanvasBase } from '@/workflow/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/components/WorkflowDiagramStepNodeEditable';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
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
        key={workflowWithCurrentVersion.currentVersion.id}
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
