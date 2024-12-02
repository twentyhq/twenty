import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useDeleteWorkflowVersionStep } from '@/workflow/hooks/useDeleteWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';

export const useDeleteStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { closeRightDrawer } = useRightDrawer();

  const deleteStep = async (stepId: string) => {
    closeRightDrawer();
    const workflowVersion = await getUpdatableWorkflowVersion(workflow);
    await deleteWorkflowVersionStep({
      workflowVersionId: workflowVersion.id,
      stepId,
    });
  };

  return {
    deleteStep,
  };
};
