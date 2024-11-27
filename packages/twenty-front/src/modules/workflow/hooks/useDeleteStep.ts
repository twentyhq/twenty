import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useDeleteWorkflowVersionStep } from '@/workflow/hooks/useDeleteWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';

export const useDeleteStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep({
    workflowId: workflow.id,
  });

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const deleteOneStep = async (stepId: string) => {
    const workflowVersion = await getUpdatableWorkflowVersion(workflow);
    await deleteWorkflowVersionStep({
      workflowVersionId: workflowVersion.id,
      stepId,
    });
  };

  return {
    deleteOneStep,
  };
};
