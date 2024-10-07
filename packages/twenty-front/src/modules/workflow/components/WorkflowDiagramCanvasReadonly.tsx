import { WorkflowDiagramCanvasBase } from '@/workflow/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasReadonlyEffect } from '@/workflow/components/WorkflowDiagramCanvasReadonlyEffect';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';

export const WorkflowDiagramCanvasReadonly = ({
  diagram,
  workflowVersion,
}: {
  diagram: WorkflowDiagram;
  workflowVersion: WorkflowVersion;
}) => {
  return (
    <WorkflowDiagramCanvasBase
      key={workflowVersion.id}
      diagram={diagram}
      status={workflowVersion.status}
      nodeTypes={{
        default: WorkflowDiagramStepNodeReadonly,
        'empty-trigger': WorkflowDiagramEmptyTrigger,
      }}
    >
      <WorkflowDiagramCanvasReadonlyEffect />
    </WorkflowDiagramCanvasBase>
  );
};
