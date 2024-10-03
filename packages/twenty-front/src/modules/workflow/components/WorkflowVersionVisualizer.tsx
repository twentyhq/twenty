import { WorkflowDiagramCanvas } from '@/workflow/components/WorkflowDiagramCanvas';
import { WorkflowDiagramEffect } from '@/workflow/components/WorkflowDiagramEffect';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import '@xyflow/react/dist/style.css';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowVersionVisualizer = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);
  const workflowDiagram = useRecoilValue(workflowDiagramState);

  return (
    <>
      <WorkflowDiagramEffect
        workflowWithCurrentVersion={workflowWithCurrentVersion}
      />

      {isDefined(workflowDiagram) && isDefined(workflowWithCurrentVersion) ? (
        <WorkflowDiagramCanvas
          diagram={workflowDiagram}
          workflowWithCurrentVersion={workflowWithCurrentVersion}
        />
      ) : null}
    </>
  );
};
