import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import {
  WorkflowStep,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();

  const updateStep = async <T extends WorkflowStep>(updatedStep: T) => {
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Could not find current workflow version');
    }

    const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

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
