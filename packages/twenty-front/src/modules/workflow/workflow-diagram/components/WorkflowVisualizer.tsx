import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import '@xyflow/react/dist/style.css';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowVisualizer = ({ workflowId }: { workflowId: string }) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  if (!isDefined(workflowWithCurrentVersion)) {
    return null;
  }

  return (
    <>
      <WorkflowDiagramEffect
        workflowWithCurrentVersion={workflowWithCurrentVersion}
      />
      <WorkflowDiagramCanvasEditable
        workflowWithCurrentVersion={workflowWithCurrentVersion}
      />
    </>
  );
};
