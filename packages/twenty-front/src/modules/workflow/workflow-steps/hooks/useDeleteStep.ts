import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { useDeleteWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useDeleteWorkflowVersionStep';

export const useDeleteStep = () => {
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { deleteStepsOutputSchema } = useStepsOutputSchema();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { closeCommandMenu } = useCommandMenu();

  const deleteStep = async (stepId: string) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    await deleteWorkflowVersionStep({
      workflowVersionId,
      stepId,
    });

    closeCommandMenu();

    deleteStepsOutputSchema({
      stepIds: [stepId],
      workflowVersionId,
    });
  };

  return {
    deleteStep,
  };
};
