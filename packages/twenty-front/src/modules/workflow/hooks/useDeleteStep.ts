import {
  WorkflowWithCurrentVersion,
  WorkflowVersion,
} from '@/workflow/types/Workflow';
import { useDeleteWorkflowVersionStep } from '@/workflow/hooks/useDeleteWorkflowVersionStep';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

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

  const deleteStep = async (stepId: string) => {
    closeRightDrawer();
    const workflowVersion = await getUpdatableWorkflowVersion(workflow);
    if (stepId === TRIGGER_STEP_ID) {
      await updateOneWorkflowVersion({
        idToUpdate: workflow.currentVersion.id,
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
