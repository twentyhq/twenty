import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowVersionOutputSchemaEffect } from '@/workflow/workflow-diagram/components/WorkflowVersionOutputSchemaEffect';
import '@xyflow/react/dist/style.css';
import { isDefined } from 'twenty-shared';

export const WorkflowVisualizer = ({ workflowId }: { workflowId: string }) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);
  const workflowVersion = workflowWithCurrentVersion?.currentVersion;

  return (
    <>
      <WorkflowDiagramEffect
        workflowWithCurrentVersion={workflowWithCurrentVersion}
      />
      {isDefined(workflowVersion) && (
        <WorkflowVersionOutputSchemaEffect workflowVersion={workflowVersion} />
      )}

      {isDefined(workflowWithCurrentVersion) ? (
        <WorkflowDiagramCanvasEditable
          versionStatus={workflowWithCurrentVersion.currentVersion.status}
        />
      ) : null}
    </>
  );
};
