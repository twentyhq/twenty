import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';

export const useUpdateStep = () => {
  const { getUpdatableWorkflowVersion, isReady } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();
  const { markStepForRecomputation } = useStepsOutputSchema();

  const updateStep = async (updatedStep: WorkflowAction) => {
    if (!isReady) {
      return { updatedStep: undefined };
    }

    const workflowVersionId = await getUpdatableWorkflowVersion();

    const result = await updateWorkflowVersionStep({
      workflowVersionId,
      step: updatedStep,
    });

    markStepForRecomputation({
      stepId: updatedStep.id,
      workflowVersionId,
    });

    return {
      updatedStep: result?.data?.updateWorkflowVersionStep,
    };
  };

  return {
    updateStep,
  };
};
