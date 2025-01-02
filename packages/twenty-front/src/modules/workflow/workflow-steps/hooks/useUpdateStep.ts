import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import {
  WorkflowStep,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { isDefined } from 'twenty-ui';

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

    const workflowVersion = await getUpdatableWorkflowVersion(workflow);
    await updateWorkflowVersionStep({
      workflowVersionId: workflowVersion.id,
      step: updatedStep,
    });
  };

  return {
    updateStep,
  };
};
