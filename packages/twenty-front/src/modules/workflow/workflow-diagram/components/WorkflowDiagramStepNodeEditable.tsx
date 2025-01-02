import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { useRecoilValue } from 'recoil';
import { FloatingIconButton, IconTrash } from 'twenty-ui';

export const WorkflowDiagramStepNodeEditable = ({
  id,
  data,
  selected,
}: {
  id: string;
  data: WorkflowDiagramStepNodeData;
  selected?: boolean;
}) => {
  const workflowId = useRecoilValue(workflowIdState);

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);
  assertWorkflowWithCurrentVersionIsDefined(workflowWithCurrentVersion);

  const { deleteStep } = useDeleteStep({
    workflow: workflowWithCurrentVersion,
  });

  return (
    <WorkflowDiagramStepNodeBase
      data={data}
      RightFloatingElement={
        selected ? (
          <FloatingIconButton
            size="medium"
            Icon={IconTrash}
            onClick={() => {
              deleteStep(id);
            }}
          />
        ) : undefined
      }
    />
  );
};
