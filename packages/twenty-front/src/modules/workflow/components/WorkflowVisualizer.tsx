import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { WorkflowDiagramCanvasEditable } from '@/workflow/components/WorkflowDiagramCanvasEditable';
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
        <WorkflowDiagramCanvasEditable
          diagram={workflowDiagram}
          workflowWithCurrentVersion={workflowWithCurrentVersion}
        />
      ) : null}
    </>
  );
};
