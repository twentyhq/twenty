import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { WorkflowDiagramCanvas } from '@/workflow/components/WorkflowDiagramCanvas';
import { WorkflowDiagramEffect } from '@/workflow/components/WorkflowDiagramEffect';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import '@xyflow/react/dist/style.css';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const WorkflowVisualizer = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const workflowId = targetableObject.id;

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
