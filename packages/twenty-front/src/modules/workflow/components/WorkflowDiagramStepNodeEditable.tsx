import { WorkflowDiagramStepNodeBase } from '@/workflow/components/WorkflowDiagramStepNodeBase';
import { useDeleteStep } from '@/workflow/hooks/useDeleteStep';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowDiagramStepNodeData } from '@/workflow/types/WorkflowDiagram';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
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
