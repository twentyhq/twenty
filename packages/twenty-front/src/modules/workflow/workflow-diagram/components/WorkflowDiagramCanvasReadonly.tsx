import { WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagramCanvasBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/workflow-diagram/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeReadonly';
import { ReactFlowProvider } from '@xyflow/react';

export const WorkflowDiagramCanvasReadonly = ({
  workflowVersion,
}: {
  workflowVersion: WorkflowVersion;
}) => {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramCanvasBase
        status={workflowVersion.status}
        nodeTypes={{
          default: WorkflowDiagramStepNodeReadonly,
          'empty-trigger': WorkflowDiagramEmptyTrigger,
        }}
      />
      <WorkflowDiagramCanvasReadonlyEffect />
    </ReactFlowProvider>
  );
};
