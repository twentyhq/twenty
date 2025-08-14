import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';

export const WorkflowVisualizer = () => {
  return (
    <>
      <WorkflowDiagramEffect />
      <WorkflowDiagramCanvasEditable />
    </>
  );
};
