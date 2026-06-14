import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';

export const useUpdateStep = () => {
  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();

  const updateStep = async (updatedStep: WorkflowAction) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    const result = await updateWorkflowVersionStep({
      workflowVersionId,
      step: updatedStep,
    });

    return {
      updatedStep: result?.data?.updateWorkflowVersionStep,
    };
  };

  return {
    updateStep,
  };
};
