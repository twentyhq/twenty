import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';
import {
  WorkflowTrigger,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';
import { useComputeStepSettingOutputSchema } from '@/workflow/hooks/useComputeStepSettingOutputSchema';

export const useUpdateWorkflowVersionTrigger = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { createNewWorkflowVersion } = useCreateNewWorkflowVersion();

  const { computeStepSettingOutputSchema } =
    useComputeStepSettingOutputSchema();

  const updateTrigger = async (updatedTrigger: WorkflowTrigger) => {
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Can not update an undefined workflow version.');
    }

    if (workflow.currentVersion.status === 'DRAFT') {
      const outputSchema = (
        await computeStepSettingOutputSchema({
          step: updatedTrigger,
        })
      )?.data?.computeStepSettingOutputSchema;

      const trigger = outputSchema
        ? { ...updatedTrigger, outputSchema }
        : updatedTrigger;

      await updateOneWorkflowVersion({
        idToUpdate: workflow.currentVersion.id,
        updateOneRecordInput: {
          trigger,
        },
      });

      return;
    }

    await createNewWorkflowVersion({
      workflowId: workflow.id,
      name: `v${workflow.versions.length + 1}`,
      status: 'DRAFT',
      trigger: updatedTrigger,
      steps: workflow.currentVersion.steps,
    });
  };

  return {
    updateTrigger,
  };
};
