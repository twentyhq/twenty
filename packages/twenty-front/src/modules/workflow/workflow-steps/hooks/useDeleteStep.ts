import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useDeleteWorkflowVersionStep } from '@/workflow/hooks/useDeleteWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { isDefined } from 'twenty-shared/utils';

export const useDeleteStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion | undefined;
}) => {
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { deleteStepsOutputSchema } = useStepsOutputSchema();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { closeCommandMenu } = useCommandMenu();

  const deleteStep = async (stepId: string) => {
    assertWorkflowWithCurrentVersionIsDefined(workflow);

    const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

    if (!isDefined(workflowVersionId)) {
      throw new Error('Could not find workflow version');
    }

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
