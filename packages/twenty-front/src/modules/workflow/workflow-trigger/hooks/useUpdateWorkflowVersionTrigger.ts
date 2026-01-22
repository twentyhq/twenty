import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';

import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useUpdateWorkflowVersionTrigger = () => {
  const { updateOneRecord: updateOneWorkflowVersion } = useUpdateOneRecord();

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const { markStepForRecomputation } = useStepsOutputSchema();

  const updateTrigger = async (updatedTrigger: WorkflowTrigger) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    await updateOneWorkflowVersion({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      idToUpdate: workflowVersionId,
      updateOneRecordInput: {
        trigger: updatedTrigger,
      },
    });

    markStepForRecomputation({
      stepId: TRIGGER_STEP_ID,
      workflowVersionId,
    });
  };

  return {
    updateTrigger,
  };
};
