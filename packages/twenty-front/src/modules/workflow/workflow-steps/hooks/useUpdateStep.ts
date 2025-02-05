import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import {
  isDefined,
  WorkflowStep,
  WorkflowWithCurrentVersion,
} from 'twenty-shared';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';

export const useUpdateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();

  const updateStep = async <T extends WorkflowStep>(updatedStep: T) => {
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Can not update an undefined workflow version.');
    }

    const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

    await updateWorkflowVersionStep({
      workflowVersionId,
      step: updatedStep,
    });
  };

  return {
    updateStep,
  };
};
