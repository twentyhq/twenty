import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useComputeStepOutputSchema } from '@/workflow/hooks/useComputeStepOutputSchema';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import {
  WorkflowTrigger,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateWorkflowVersionTrigger = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
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
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Cannot find current workflow version');
    }

    const workflowVersionId = await getUpdatableWorkflowVersion(workflow);

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

    if (!isDefined(workflowVersionId)) {
      throw new Error('Workflow version not found');
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
