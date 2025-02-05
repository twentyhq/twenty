import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { WorkflowDiagramStepNodeEditableContent } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditableContent';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { useRecoilValue } from 'recoil';

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
    <WorkflowDiagramStepNodeEditableContent
      data={data}
      variant="default"
      selected={selected ?? false}
      onDelete={() => {
        deleteStep(id);
      }}
    />
  );
};
