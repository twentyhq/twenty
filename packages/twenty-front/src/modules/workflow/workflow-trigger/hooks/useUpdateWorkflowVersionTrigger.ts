import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useComputeStepOutputSchema } from '@/workflow/hooks/useComputeStepOutputSchema';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import {
  type WorkflowTrigger,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';

export const useUpdateWorkflowVersionTrigger = () => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

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
          workflowVersionId,
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
