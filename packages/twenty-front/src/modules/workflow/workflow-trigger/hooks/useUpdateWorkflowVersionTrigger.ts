import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import {
  type WorkflowTrigger,
  type WorkflowVersion,
} from '@/workflow/types/Workflow';

import { useStepsOutputSchema } from '@/workflow/workflow-variables/hooks/useStepsOutputSchema';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useUpdateWorkflowVersionTrigger = () => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow();

  const { markStepForRecomputation } = useStepsOutputSchema();

  const updateTrigger = async (updatedTrigger: WorkflowTrigger) => {
    const workflowVersionId = await getUpdatableWorkflowVersion();

    await updateOneWorkflowVersion({
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
