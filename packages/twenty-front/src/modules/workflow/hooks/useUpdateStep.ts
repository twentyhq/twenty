import {
  WorkflowStep,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useUpdateWorkflowVersionStep } from '@/workflow/hooks/useUpdateWorkflowVersionStep';

export const useUpdateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();

  const updateStep = async <T extends WorkflowStep>(
    updatedStep: T,
    shouldUpdateStepOutput = true,
  ) => {
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Can not update an undefined workflow version.');
    }

    const workflowVersion = await getUpdatableWorkflowVersion(workflow);
    await updateWorkflowVersionStep({
      workflowVersionId: workflowVersion.id,
      step: updatedStep,
      shouldUpdateStepOutput,
    });
  };

  return {
    updateStep,
  };
};
