import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useDeleteWorkflowVersionStep } from '@/workflow/hooks/useDeleteWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';

export const useDeleteStep = () => {
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { deleteStepsOutputSchema } = useStepsOutputSchema();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { closeCommandMenu } = useCommandMenu();

  const deleteStep = async (stepId: string) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const workflowVersionStepChanges = await deleteWorkflowVersionStep({
      workflowVersionId,
      stepId,
    });

    closeCommandMenu();

    deleteStepsOutputSchema({
      stepIds: workflowVersionStepChanges?.deletedStepIds ?? [],
      workflowVersionId,
    });
  };

  return {
    deleteStep,
  };
};
