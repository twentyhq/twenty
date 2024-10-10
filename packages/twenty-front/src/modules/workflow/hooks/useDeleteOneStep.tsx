import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { removeStep } from '@/workflow/utils/removeStep';

export const useDeleteOneStep = ({
  stepId,
  workflow,
}: {
  stepId: string;
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { createNewWorkflowVersion } = useCreateNewWorkflowVersion();

  const deleteOneStep = async () => {
    if (workflow.currentVersion.status !== 'DRAFT') {
      const newVersionName = `v${workflow.versions.length + 1}`;

      if (stepId === TRIGGER_STEP_ID) {
        await createNewWorkflowVersion({
          workflowId: workflow.id,
          name: newVersionName,
          status: 'DRAFT',
          trigger: null,
          steps: workflow.currentVersion.steps,
        });
      } else {
        await createNewWorkflowVersion({
          workflowId: workflow.id,
          name: newVersionName,
          status: 'DRAFT',
          trigger: workflow.currentVersion.trigger,
          steps: removeStep({
            steps: workflow.currentVersion.steps ?? [],
            stepId,
          }),
        });
      }

      return;
    }

    if (stepId === TRIGGER_STEP_ID) {
      await updateOneWorkflowVersion({
        idToUpdate: workflow.currentVersion.id,
        updateOneRecordInput: {
          trigger: null,
        },
      });
    } else {
      await updateOneWorkflowVersion({
        idToUpdate: workflow.currentVersion.id,
        updateOneRecordInput: {
          steps: removeStep({
            steps: workflow.currentVersion.steps ?? [],
            stepId,
          }),
        },
      });
    }
  };

  return {
    deleteOneStep,
  };
};
