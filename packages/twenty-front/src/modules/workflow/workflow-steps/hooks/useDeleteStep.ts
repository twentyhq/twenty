import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDeleteWorkflowVersionStep } from '@/workflow/hooks/useDeleteWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useStepsOutputSchema } from '@/workflow/hooks/useStepsOutputSchema';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';

export const useDeleteStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion | undefined;
}) => {
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });
  const { deleteStepOutputSchema } = useStepsOutputSchema();

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { closeCommandMenu } = useCommandMenu();

  const deleteStep = async (stepId: string) => {
    assertWorkflowWithCurrentVersionIsDefined(workflow);

    closeCommandMenu();

    const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

    if (stepId === TRIGGER_STEP_ID) {
      await updateOneWorkflowVersion({
        idToUpdate: workflowVersionId,
        updateOneRecordInput: {
          trigger: null,
        },
      });
    } else {
      await deleteWorkflowVersionStep({
        workflowVersionId,
        stepId,
      });
    }
    deleteStepOutputSchema({
      stepId,
      workflowVersionId,
    });
  };

  return {
    deleteStep,
  };
};
