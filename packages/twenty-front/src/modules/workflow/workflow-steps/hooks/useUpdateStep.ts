import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { type WorkflowStep } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateStep = () => {
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();

  const updateStep = async <T extends WorkflowStep>(updatedStep: T) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    if (!isDefined(workflowVersionId)) {
      throw new Error('Workflow version not found');
    }

    await updateWorkflowVersionStep({
      workflowVersionId,
      step: updatedStep,
    });
  };

  return {
    updateStep,
  };
};
