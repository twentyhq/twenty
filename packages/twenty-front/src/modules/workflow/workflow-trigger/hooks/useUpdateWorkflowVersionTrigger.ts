import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useComputeStepOutputSchema } from '@/workflow/hooks/useComputeStepOutputSchema';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import {
  type WorkflowTrigger,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';

export const useUpdateWorkflowVersionTrigger = () => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { getUpdatableWorkflowVersion } = useGetUpdatableWorkflowVersion();

  const { computeStepOutputSchema } = useComputeStepOutputSchema();

  const updateTrigger = async (
    updatedTrigger: WorkflowTrigger,
    options: { computeOutputSchema: boolean } = { computeOutputSchema: true },
  ) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    if (options.computeOutputSchema) {
      const outputSchema = (
        await computeStepOutputSchema({
          step: updatedTrigger,
        })
      )?.data?.computeStepOutputSchema;

      updatedTrigger.settings = {
        ...updatedTrigger.settings,
        outputSchema: outputSchema || {},
      };
    }

    await updateOneWorkflowVersion({
      idToUpdate: workflowVersionId,
      updateOneRecordInput: {
        trigger: updatedTrigger,
      },
    });
  };

  return {
    updateTrigger,
  };
};
