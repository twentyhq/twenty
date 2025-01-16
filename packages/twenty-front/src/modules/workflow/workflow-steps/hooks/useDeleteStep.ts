import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { useDeleteWorkflowVersionStep } from '@/workflow/hooks/useDeleteWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';

export const useDeleteStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { deleteWorkflowVersionStep } = useDeleteWorkflowVersionStep();
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();
  const { closeRightDrawer } = useRightDrawer();
  const { closeCommandMenu } = useCommandMenu();

  const deleteStep = async (stepId: string) => {
    closeRightDrawer();
    closeCommandMenu();
    const workflowVersion = await getUpdatableWorkflowVersion(workflow);
    if (stepId === TRIGGER_STEP_ID) {
      await updateOneWorkflowVersion({
        idToUpdate: workflowVersion.id,
        updateOneRecordInput: {
          trigger: null,
        },
      });
      return;
    }
    await deleteWorkflowVersionStep({
      workflowVersionId: workflowVersion.id,
      stepId,
    });
  };

  return {
    deleteStep,
  };
};
