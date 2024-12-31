import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { workflowDiagramState } from '@/workflow/workflow-diagram/states/workflowDiagramState';
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
        <WorkflowDiagramCanvasEditable
          diagram={workflowDiagram}
          workflowWithCurrentVersion={workflowWithCurrentVersion}
        />
      ) : null}
    </>
  );
};
