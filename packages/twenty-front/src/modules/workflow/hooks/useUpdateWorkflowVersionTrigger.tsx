import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  WorkflowTrigger,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-ui';

export const useUpdateWorkflowVersionTrigger = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const updateTrigger = async (updatedTrigger: WorkflowTrigger) => {
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Can not update an undefined workflow version.');
    }

    await updateOneWorkflowVersion({
      idToUpdate: workflow.currentVersion.id,
      updateOneRecordInput: {
        trigger: updatedTrigger,
      },
    });
  };

  return {
    updateTrigger,
  };
};
