import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';
import { WorkflowDiagramStepNodeBase } from '@/workflow/components/WorkflowDiagramStepNodeBase';
import { useDeleteOneStep } from '@/workflow/hooks/useDeleteOneStep';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowDiagramStepNodeData } from '@/workflow/types/WorkflowDiagram';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { useRecoilValue } from 'recoil';
import { IconTrash } from 'twenty-ui';

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

  const { deleteOneStep } = useDeleteOneStep({
    workflow: workflowWithCurrentVersion,
    stepId: id,
  });

  return (
    <WorkflowDiagramStepNodeBase
      data={data}
      RightFloatingElement={
        selected ? (
          <FloatingIconButton
            Icon={IconTrash}
            onClick={() => {
              return deleteOneStep();
            }}
          />
        ) : undefined
      }
    />
  );
};
