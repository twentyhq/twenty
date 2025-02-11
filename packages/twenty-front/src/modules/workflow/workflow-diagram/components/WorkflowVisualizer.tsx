import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import '@xyflow/react/dist/style.css';
import { isDefined } from 'twenty-shared';

export const WorkflowVisualizer = ({ workflowId }: { workflowId: string }) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  return (
    <>
      <WorkflowDiagramEffect
        workflowWithCurrentVersion={workflowWithCurrentVersion}
      />

      {isDefined(workflowWithCurrentVersion) ? (
        <WorkflowDiagramCanvasEditable
          workflowWithCurrentVersion={workflowWithCurrentVersion}
        />
      ) : null}
    </>
  );
};
